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
    let response = null;
    try{
      response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    }catch(e){
      console.log(e);
    }
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
    let response = null;
    try{
      response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText()).files[0];
    }catch(e){
      console.log(e);
    }
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
    let response = null;
    try{
       response = UrlFetchApp.fetch(url, options).getContentText();
    }catch(e){
      console.log(e);
    }
  }
  findPosts(arrObjects = [],limit = 20){
    const parseJson = function(obj){
      let stringObj = "";
      Object.entries(obj).forEach(([key, value]) => stringObj+=`${key}:${value}`); 
      return stringObj;
    }
    let globalquery = "";
    let this_ = this;
    arrObjects.forEach(function(object,key){
      let query = "";
        query+= `fullText contains '%22${parseJson(object)}%22'`;
      if(arrObjects.length > 1){
        globalquery+= key+1 != arrObjects.length ? `(${query}) or ` : `(${query})`;
      }else{
        globalquery = query;
      }
    })
    globalquery = {"values":`and (${globalquery})`};
    return this.getPosts(limit,globalquery);
  }
  getPosts(limit = 20,dopArgs = ""){
    let orderBy = "";
    if(typeof(dopArgs) == "string"){
      orderBy = "orderBy=createdTime desc&";
    }else{
      dopArgs = dopArgs.values;
    }
    
    const url = `https://www.googleapis.com/drive/v3/files/?pageSize=${limit}&${orderBy}q='${this.base.id}' in parents and trashed%3Dfalse ${dopArgs}`;
    const options = {
      "method":"GET",
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    let response = null;
    try{
       response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText()).files;
    }catch(e){
      console.log(e);
    }
    return response;
  }
  getPostById(postId){
    const url = `https://www.googleapis.com/drive/v3/files/${postId}?fields=*`;
    const options = {
      "method":"GET",
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    let response = null;
    try{
      response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
      let inBase = response?.parents?.includes(this_.base.id);
      if(!inBase){response = null;}
    }catch(e){
      console.log(e);
    }
    return response;
  }
  getValuePosts(postsIds){
    let values = {};
    let this_ = this;
    postsIds.forEach(function(id){
      const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
      const options = {
        "method":"GET",
        "headers":{
          "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
        }
      };let response = null;
        let inBase = this_.getPostById(id);
        if(!inBase){return;}
      try{
        response = UrlFetchApp.fetch(url, options).getContentText();
        values[id] = JSON.parse(response);
      }catch{
      }
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
    let response;
    try{
      response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
      return !content ? response : this.editPost(response.id,content);
    }catch{
    }
  }
  deletePost(postId){
    const url = `https://www.googleapis.com/drive/v3/files/${postId}`;
    const options = {
      "method":"DELETE",
      "headers":{
        "Authorization":`Bearer ${ScriptApp.getOAuthToken()}`
      }
    };
    let response = null;
    let inBase = this.getPostById(postId);
    if(!inBase){return response;}
    try{
      response = UrlFetchApp.fetch(url, options).getResponseCode();
    }catch(e){
      console.log(e);
    }
    return response;
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
    let response = null;
    let inBase = this.getPostById(postId);
    if(!inBase){return response;}
    try{
      response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    }catch(e){
      console.log(e);
    }
    return response;
  }
 
}

function init(name){
  return new GappsDapi(name);
}
