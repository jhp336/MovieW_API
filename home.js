var express = require('express');
var _ = require('lodash');
var router = express.Router();
var db = require('./module/db.js');
 
router.use(express.urlencoded({extended:false}))


router.get('/readMovieList', function(req,res){
    var type = req.query.type;
    var response = db.get('outlines').value();
    if(type==1){
        response=_.sortBy(response,'share_rate').reverse();
    }
    else if (type==2){
        response=_.sortBy(response,'user_rating').reverse();
    }
    else if (type==3){
        response=_.sortBy(response,'date');
    }
    else response = null;

    if(response!=null)
        res.send({
            "message":"movie readMovieList 성공","code":200,"resultType":"list","result":response
        });
    else res.send('잘못된 parameter!');

})
router.get('/readMovie',function(req,res){
    var id = req.query.id;
    var response = db.get('details').find({
        id: Number(id)
    }).value();
    if(response!=null)
        res.send({
            "message":"movie readMovie 성공","code":200,"resultType":"list","result":[
                response
            ]
        });
    else res.send('오류!!!');
})

router.get('/readCommentList',function(req,res){
    var id = req.query.id;
    var limit = req.query.limit;
    var response = db.get('comments').find({
        movieId: Number(id)
    }).get('cmt').value();
    var totalcount = response.length;
    response=_.sortBy(response,'recommend').reverse();
    if(limit!=null)
        response=_.take(response,limit);
    res.send({
        "message":"movie readCommentList 성공","code":200,"resultType":"list","totalCount":totalcount,"result":
            response
    });
})

router.post('/increaseLikeDisLike',function(req,res){
    var id = req.body.id;
    var likeyn = req.body.likeyn;
    var dislikeyn = req.body.dislikeyn;
    if(likeyn==="Y"){
        db.get('details').find({
            id:Number(id)
        }).assign({
            like:db.get('details').find({
                id:Number(id)
            }).get('like').value()+1
        }).write();
        res.send({"message":"movie increaseLikeDisLike 성공","code":200,"resultType":"string","result":"좋아요 적용."});
    }
    else if (likeyn==="N"){
        db.get('details').find({
            id:Number(id)
        }).assign({
            like:db.get('details').find({
                id:Number(id)
            }).get('like').value()-1
        }).write();
        res.send({"message":"movie increaseLikeDisLike 성공","code":200,"resultType":"string","result":"좋아요 취소."});
    }
    else if(dislikeyn==="Y"){
        db.get('details').find({
            id:Number(id)
        }).assign({
            dislike:db.get('details').find({
                id:Number(id)
            }).get('dislike').value()+1
        }).write();
        res.send({"message":"movie increaseLikeDisLike 성공","code":200,"resultType":"string","result":"싫어요 적용."});
    }
    else if(dislikeyn==="N"){
        db.get('details').find({
            id:Number(id)
        }).assign({
            dislike:db.get('details').find({
                id:Number(id)
            }).get('dislike').value()-1
        }).write();
        res.send({"message":"movie increaseLikeDisLike 성공","code":200,"resultType":"string","result":"싫어요 취소."});
    }
})

router.post('/increaseRecommend',function(req,res){
    var movieid = req.body.movie_id;
    var reviewid = req.body.review_id;
    var yn = req.body.recommendyn;
    if(yn==="Y"){
        db.get('comments').find({
            movieId:Number(movieid)
        }).get('cmt').find({
            id:Number(reviewid)
        }).assign({
            recommend:db.get('comments').find({
                movieId:Number(movieid)
            }).get('cmt').find({
                id:Number(reviewid)
            }).get('recommend').value()+1
        }).write();
        res.send({"message":"movie increaseRecommend 성공","code":200,"resultType":"string","result":"추천되었습니다."});
    }
    else if(yn==="N"){
        db.get('comments').find({
            movieId:Number(movieid)
        }).get('cmt').find({
            id:Number(reviewid)
        }).assign({
            recommend:db.get('comments').find({
                movieId:Number(movieid)
            }).get('cmt').find({
                id:Number(reviewid)
            }).get('recommend').value()-1
        }).write();
        res.send({"message":"movie increaseRecommend 성공","code":200,"resultType":"string","result":"추천 취소되었습니다."});
    }
})

router.post('/createComment',function(req,res){
    var post = req.body;
    var id = post.id;
    var writer = post.writer;
    var rating = post.rating;
    var contents = post.contents;

    var dt = new Date;
    var year = dt.getFullYear();
    var month = ('0' + (dt.getMonth() + 1)).slice(-2);
    var day = ('0' + dt.getDate()).slice(-2);
    var hour = ('0' + dt.getHours()).slice(-2);
    var min = ('0' + dt.getMinutes()).slice(-2);
    var sec = ('0' + dt.getSeconds()).slice(-2);
    var now = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' +sec;

    var num = 1;
    if(db.get('comments').find({movieId:Number(id)}).value()==null){
        db.get('comments').push({
            movieId:Number(id),
            cmt:[{
                id:num,
                writer:writer,
                movieId:Number(id),
                writer_image:null,
                time:now,
                timestamp:null,
                rating:rating,
                contents:contents,
                recommend:0
            }]
        }).write();
    }
    else {
        num = db.get('comments').find({
            movieId:Number(id)
        }).get('cmt').value().length;
        db.get('comments').find({
            movieId:Number(id)
        }).get('cmt').push({
            id:num+1,
            writer:writer,
            movieId:Number(id),
            writer_image:null,
            time:now,
            timestamp:null,
            rating:Number(rating),
            contents:contents,
            recommend:0
        }).write();
    }
    res.send({"message":"movie createComment 성공","code":200,"resultType":"string","result":"코멘트 작성 완료"});
})
module.exports = router; 