class gameTable {
  constructor(tableName, tableId) {
    this.name = tableName;
    this.id = tableId;
    this.tableName = null;
    this.participants = [];
    this.gamePosition = null;
    this.tableSide = "white";
  }
}

module.exports = gameTable;