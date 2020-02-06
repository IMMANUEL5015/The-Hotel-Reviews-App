async function deleteCommentId(arr, id, model){
    for(var i = 0; i < arr.length; i++){
        if(arr[i].equals(id)){
            arr.splice(i, 1);
            return await model.save();
        }
    }
}

module.exports = deleteCommentId;