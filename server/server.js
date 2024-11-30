const gameTable = require('./table.js');
const e = require('express');
const http = require('http');
const Server = require("socket.io").Server;
const app = e();
const PORT = 10099;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const initialGamePosition = "0101010110101010010101010000000000000000303030300303030330303030";

const tableOne = new gameTable("table_1", 1);
const tableTwo = new gameTable("table_2", 2);
const tableThree = new gameTable("table_3", 3);
const tableFour = new gameTable("table_4", 4);

class Participant {
  constructor() {
    this.participantName = Math.floor(Math.random() * 1000);
    this.tableId = null;
    this.tableName = null;
    this.playerSide = null;
  }
}
let participants = [];

const tableMap = {
  "table_1": tableOne,
  "table_2": tableTwo,
  "table_3": tableThree,
  "table_4": tableFour,
}

function joinTable(socket, participant, tableName, tableId) {
  if (tableMap[tableName].participants?.includes(participant.participantName)) return;
  let otherParticipant = participants.find((participant) => participant.tableName == tableName)?.playerSide;
  if (otherParticipant && participants.find((participant) => participant.tableName == tableName).playerSide == "white") {
    participant.playerSide = "red";
  } else {
    participant.playerSide = "white";
  }

  socket.join(tableName);
  resetTable(tableMap[tableName], socket);
  sendTableStatus();
  participant.tableId = tableId;
  participant.tableName = tableName;
  tableMap[tableName].participants.push(participant.participantName);
  socket.emit("recieve_player_color", participant.playerSide)
  socket.emit("recieve_table_color", "white");
  io.to(tableName).emit("recieve_foe_user", tableMap[participant.tableName].participants)
  logRooms();
}

function resetTable(table, socket) {
  table.gamePosition = initialGamePosition;
  table.tableSide = "white";
  io.to(table.name).emit("recieve_fen", initialGamePosition);
  io.to(table.name).emit("recieve_table_color", "white");
}

function leaveTable(socket, participant) {
  if (participant.tableName == null) return;
  io.to(participant.tableName).emit('chat_recieve_message', {
    text: ` left the table`,
    username: `${participant.participantName}`,
    id: `${socket.id}${Math.random()}`,
    sockedID: socket.id,
    joinMessage: false,
    leaveMessage: true,
  })

  socket.leave(participant.tableName);
  tableMap[participant.tableName].participants = tableMap[participant.tableName].participants
    .filter((player) => player != participant.participantName);
  io.to(participant.tableName).emit("recieve_foe_user", tableMap[participant.tableName].participants)
  participant.tableName = null;
  participant.tableId = null;
  participant.playerSide = null;
  logRooms();
}

async function logRooms() {
  let tableOne = await io.in(`table_1`).fetchSockets()
  let tableTwo = await io.in(`table_2`).fetchSockets()
  let tableThree = await io.in(`table_3`).fetchSockets()
  let tableFour = await io.in(`table_4`).fetchSockets()
  console.log("TABLE ONE:")
  tableOne.forEach((participant) => console.log(participant.id))
  console.log("TABLE TWO:")
  tableTwo.forEach((participant) => console.log(participant.id))
  console.log("TABLE THREE:")
  tableThree.forEach((participant) => console.log(participant.id))
  console.log("TABLE FOUR:")
  tableFour.forEach((participant) => console.log(participant.id))
}

function sendTableStatus() {
  io.emit("recieve_table_status", {
    table_1: tableOne.participants.length,
    table_2: tableTwo.participants.length,
    table_3: tableThree.participants.length,
    table_4: tableFour.participants.length,
  });
}
setInterval(sendTableStatus, 100);

function changeTableSide(table) {
  if (table.tableSide == "white") {
    table.tableSide = "red";
  } else {
    table.tableSide = "white";
  }
}

io.on('connection', (socket) => {
  socket.emit("recieve_new_connection");
  let participant = new Participant();
  participants.push(participant);
  console.log(`⚡: ${socket.id} participant just connected!`);
  console.log(participants.map((item) => item.participantName));

  socket.on('disconnect', () => {
    console.log('🔥: A participant disconnected');
    participants = participants.filter((item) => participant.participantName != item.participantName)
    leaveTable(socket, participant)
    console.log(participants);
  });

  socket.on("user_login", (data) => {
    console.log("Participant just logged in", data)
    participant.participantName = data;
  })

  socket.on('request_username', () => {
    socket.emit('recieve_username', participant.participantName)
  })

  socket.on("request_leave_table", () => {
    if (participant.tableName) {
      leaveTable(socket, participant);
    }
  })

  socket.on("request_reset_table", () => {
    resetTable(tableMap[participant.tableName], socket);
    io.to(participant.tableName).emit('chat_recieve_message', {
      text: ` reset the table.`,
      username: `${participant.participantName}`,
      id: `${socket.id}${Math.random()}`,
      sockedID: socket.id,
      joinMessage: false,
      leaveMessage: true,
    })
    console.log("received")
  })

  socket.on("request_fen", (data) => {
    let table = tableMap[participant.tableName];
    console.log(participant)
    console.log(table)
    table.gamePosition = data;
    io.to(participant.tableName).emit("recieve_fen", table.gamePosition);
  })

  socket.on("request_change_turn", () => {
    let table = tableMap[participant.tableName];
    changeTableSide(table);
    io.to(participant.tableName).emit("recieve_table_color", table.tableSide);
  })

  socket.on('request_flip', () => {
    if (participant.playerSide == "red") {
      socket.emit('recieve_flip')
    }
  });

  socket.on('chat_send_message', (data) => {
    io.to(participant.tableName).emit("chat_recieve_message", data);
  })

  socket.on('join_table', (tableName, tableId) => {
    joinTable(socket, participant, tableName, tableId);
  })
});