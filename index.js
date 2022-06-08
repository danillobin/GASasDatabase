class GASDasDatabase{    
  constructor(name){
    this.folder = DriveApp.getFoldersByName(name);
    if(this.folder.hasNext()){
      this.folder = this.folder.next();
    }else{
      this.folder = DriveApp.createFolder(name);
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
  dataToObject(id,post){
    let postObj = {};
    postObj.id = id;
    postObj.post = post;
    return postObj;
  }
  createPost(content = "",id = ""){
    content = JSON.stringify(content);
    let date = Utilities.formatDate(new Date(), "GMT", "yyMdHmsS");
    id = id ? id : Utilities.base64Encode(date)+this.getRandomInt(100000,999999);
    let post = this.folder.createFile(id,content);
    let postObj = this.dataToObject(id,post);
    return postObj;
  }
  deletePost(post){
    return post.setTrashed(true);
  }
  getValue(post){
    let postValue = post.getBlob().getDataAsString();
    if(postValue){
      postValue = JSON.parse(postValue);
    }
    return postValue;
  }
  setValue(post,content){
    content = JSON.stringify(content);
    return post.setContent(content);
  }
  getPosts(attrs = []){
    let posts = this.folder.getFiles();
    let need_posts = [];
    let this_ = this;
    while(posts.hasNext()){
      let post = posts.next();
      let postValue = this.getValue(post)
      if(typeof(postValue) == "object"){
        if(typeof(attrs) == "object" && attrs.length){
          attrs.forEach(function(attr){
              for (const [key, value] of Object.entries(attr)) {
                let keys = Object.keys(attr);
                if(postValue[key] != value){
                  break;
                }else if(keys[keys.length-1] == key){
                  let postObj = this_.dataToObject(post.getName(),post);
                  need_posts.push(postObj);
                  return;
                }
              }
          })
        }else{
          let postObj = this_.dataToObject(post.getName(),post);
          need_posts.push(postObj);
        }
      }
    }
    return need_posts;
  }
}
