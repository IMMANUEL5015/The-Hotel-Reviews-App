function calculateAverage(reviews){
    if(reviews.length === 0){
        return 0;
    }else{
        let sum = 0;
        reviews.forEach(function(review){
            sum+=review.rating;
        });
        return sum / reviews.length;
    }
}

module.exports = calculateAverage;