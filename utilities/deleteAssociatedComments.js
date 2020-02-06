const deleteAssociatedComments = async (arr, model) => {
    for(var i = 0; i < arr.length; i++){
        await model.findByIdAndDelete(arr[i]);
    }
}

module.exports = deleteAssociatedComments;