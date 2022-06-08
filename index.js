class GASasDatabase{    
  constructor(sheet){
    this.sheet = sheet;
    this.init();
  }
  init(){
    this.last_col = this.sheet.getLastColumn();
    this.last_row = this.sheet.getLastRow();
    this.data = this.sheet.getDataRange().getValues().splice(1);
    this.keys = this.sheet.getDataRange().getValues().splice(0,1).flat();
  }
  getValueRow(rowID){
    if(!rowID){return null;}
    let row = {};
    row.id = rowID;
    row.values = this.sheet.getRange(rowID,1,1,this.last_col).getValues().flat();
    return row;
  }
  getValueRowWithKeys(row){
    let this_ = this;
    if(typeof(row) == "number"){
      row = this.getValueRow(row);
    }else if(typeof(row) != "object"){
      return null;
    }
    row.values = Object.assign({},row.values);
    for (let [key, value] of Object.entries(row.values)){
      delete row.values[key];
      let i = this_.keys[key];
      row.values[i] = value;
    }
    return row;
  }
  clearKeys(obj){
    let this_ = this;
    obj.values = Object.keys(obj.values).map((key) => obj.values[key]);
    return obj;
  }
  getRowsIds(attrs){
    if(!attrs){return this.data.map((i,e) => e = e+2);}
    let result = [];
    let this_ = this;
    attrs.forEach(function(attr){
      let rows = [];
      for (const [key, value] of Object.entries(attr)) {
        let numCol = this_.keys.indexOf(key)+1;
        rows[numCol] = [];
        let data = this_.sheet.getRange(2,numCol,this_.last_row,1).getValues().flat();
        let idx = data.indexOf(value);
        while (idx != -1) {
          rows[numCol].push(idx + 2);
          idx = data.indexOf(value, idx + 1);
        }
      }
      result.push(rows.reduce((p,c) => p.filter(e => c.includes(e))));
    })
    return result.flat();
  }
  updateRows(rows){
    let this_ = this;
    let last_updated_id;
    rows.forEach(function(row){
      for (const [key, value] of Object.entries(row.values)){
        last_updated_id = row.id;
        this_.sheet.getRange(row.id,1,1,this_.last_col).setValues([row.values]);
      }
    })
    return this.getValueRow(last_updated_id);
  }

  delete(rows){
    let this_ = this;
    rows.forEach(function(el){
      this_.sheet.deleteRow(el.id);
    })
    this.init();
  }

  new(attrs){
    let arr = [];
    let this_ = this;
    for (const [key, value] of Object.entries(attrs)) {
      let index_needle = this_.keys.indexOf(key);
      if(index_needle != -1){
        arr[index_needle] = value;
      }
    }
    if(arr.length){
      this.sheet.appendRow(arr);
      this.init();
    }
  }
}
