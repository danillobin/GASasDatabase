class GappsDapi{    
  constructor(basename = ""){
    this.base = this.getBase(basename) || this.createBase(basename);
  }
  createBase(name){
    const url = `https://www.googleapis.com/drive/v3/files/`;
    let options = {
      "method":"POST",
      "contentType":"application/json",
      "payload":JSON.stringify({
        "mimeType": "application/vnd.google-apps.folder",
        "name": name
      }),
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    const response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    return response;
  }
  getBase(name){
    const url = `https://www.googleapis.com/drive/v3/files/?q=name='${name}' and trashed=false and mimeType = 'application/vnd.google-apps.folder'`;
    const options = {
      "method":"GET",
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    const response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText()).files[0];
    return response;
  }
  deleteBase(baseId = this.base.id){
    const url = `https://www.googleapis.com/drive/v3/files/${baseId}`;
    const options = {
      "method":"DELETE",
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    const response = UrlFetchApp.fetch(url, options).getContentText();
  }
  parseJson(obj){
      let stringObj = "";
      Object.entries(obj).forEach(([key, value]) => stringObj+=`${key}:${value}`); 
      return stringObj;
  }
  findPosts(arrObjects = [],limit = 20){
    let globalquery = "";
    let this_ = this;
    arrObjects.forEach(function(object,key){
      let query = "";
        query+= `fullText contains '%22${this_.parseJson(object)}%22'`;
      if(arrObjects.length > 1){
        globalquery+= key+1 != arrObjects.length ? `(${query}) or ` : `(${query})`;
      }else{
        globalquery = query;
      }
    })
    globalquery = `and (${globalquery})`;
    return this.getPosts(limit,globalquery);
  }
  getPosts(limit = 20,dopArgs = ""){
    const orderBy = !dopArgs ? "orderBy=createdTime desc&" : "";
    const url = `https://www.googleapis.com/drive/v3/files/?pageSize=${limit}&${orderBy}q='${this.base.id}' in parents and trashed=false ${dopArgs}`;
    const options = {
      "method":"GET",
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    const response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText()).files;
    return response;
  }
  getValuePosts(postsIds){
    let values = {};
    postsIds.forEach(function(id){
      const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
      const options = {
        "method":"GET",
        "headers":{
          "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
        }
      };
      const response = UrlFetchApp.fetch(url, options).getContentText();
      values[id] = JSON.parse(response);
    })
    
    return values;
  }
  createPost(content = ""){
    const getRandomInt = function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }
    const name = Utilities.base64Encode(new Date().valueOf())+getRandomInt(100000,999999);
    const url = `https://www.googleapis.com/drive/v3/files/`;
    const options = {
      "contentType":"application/json",
      "method":"POST",
      "payload":JSON.stringify({
        "mimeType": "text/plain",
        "parents":[this.base.id],
        "name": name
      }),
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    const response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    return !content ? response : this.editPost(response.id,content);
  }
  deletePost(postId){
    this.fetch(`https://www.googleapis.com/drive/v3/files/${postId}`,"DELETE");
  }
  editPost(postId,content = ""){
    const url = `https://www.googleapis.com/upload/drive/v3/files/${postId}`;
    const options = {
      "method":"PATCH",
      "contentType":"text/plain",
      "payload":JSON.stringify(content),
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    const response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    return response;
  }
 
}

function init(name){
  return new GappsDapi(name);
}
