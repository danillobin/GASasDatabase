(class GASDasDatabase{    
  constructor(name){
    this.folder = DriveApp.getFoldersByName(name);
    if(this.folder.hasNext()){
      this.folder = this.folder.next();
    }else{
      this.folder = DriveApp.createFolder(name);
    }
  }
  clearBase(){
    let posts = this.folder.getFiles();
    while (posts.hasNext()) {
      posts.next().setTrashed(true);
    }
  }
  deleteBase(){
    this.folder.setTrashed(true);
    for (const [key, value] of Object.entries(this)) {
      delete this[key];
    }
  }
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
  dataToObject(post,id,value){
    let postObj = {};
    postObj.id = id;
    postObj.post = post;
    postObj.value = value;
    return postObj;
  }
  createPost(content = "",id = "",mimetype = MimeType.PLAIN_TEXT){
    content = JSON.stringify(content);
    id = id ? id : Utilities.base64Encode(new Date().valueOf())+this.getRandomInt(100000,999999);
    let post = this.folder.createFile(id,content,mimetype);
    let postObj = this.dataToObject(post,id,this.getValue(post));
    return postObj;
  }
  deletePost(post){
    return post.setTrashed(true);
  }
  searchPosts(filters = "",limit = 20,offset = 0){
    if(isNaN(limit) || isNaN(offset)){return [];}
    let posts;
    if(!filters){
      posts = this.folder.getFiles();
    }else{
      posts = this.folder.searchFiles(filters);
    }
    let searched_posts = [];
    let i = 0;
    while (posts.hasNext()) {
      i++;
      let post = posts.next();
      if(i <= offset){continue;}
      let obj = this.dataToObject(post,post.getName(),this.getValue(post));
      let dateCreatedNew = new Date(post.getDateCreated()).valueOf();
      let dateCreatedPrev = new Date(searched_posts[0]?.getDateCreated?.()).valueOf();
      if(dateCreatedNew > dateCreatedPrev){
        searched_posts.unshift(obj);
      }else{
        searched_posts.splice(1, 0, obj);
      }
      if(searched_posts.length >= limit && limit != 0){
        break;
      }
    }
    return searched_posts;
  }
  getValue(post){
    let postValue = post.getBlob().getDataAsString();
    if(postValue){
      postValue = JSON.parse(postValue);
    }
    return postValue;
  }
  setValue(content,post){
    content = JSON.stringify(content);
    return post.setContent(content);
  }
  getPosts(arrObjects = [],limit = 20,offset = 0){
    let globalquery = "";
    arrObjects.forEach(function(object,key){
      let query = "";
      for (const [key, value] of Object.entries(object)) {
        let filter = `fullText contains '"${key}":${value}'`;
        query+= query ? " and "+filter : filter;
      }
      if(arrObjects.length > 1){
        globalquery+= key+1 != arrObjects.length ? `(${query}) or ` : `(${query})`;
      }else{
        globalquery = query;
      }
    })
    let posts = this.searchPosts(globalquery,limit,offset);
    return posts;
  }
})
