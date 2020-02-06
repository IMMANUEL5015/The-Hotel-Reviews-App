const deleteAssociatedDocuments = async (arr, model, userid) => {
    for(var i = 0; i < arr.length; i++){
        if(arr[i].author.id.equals(userid)){
            await model.findByIdAndDelete(arr[i]._id);
        }
    }
}

module.exports = deleteAssociatedDocuments;