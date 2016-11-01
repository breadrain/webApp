/*--String.prototype--*/
~function(pro){
    function queryURLParameter(){
        var obj={},
            reg = /([^?=&#]+)=([^?=&#]+)/g;
        this.replace(reg,function(){
            obj[arguments[1]] = arguments[2];
        });
        return obj;
    }
    pro.queryURLParameter = queryURLParameter;
}(String.prototype);

/*LOADING*/
var loadingRender = (function(){
    var fileAry=[
        "imgs/zf_concatAddress.png", "imgs/zf_concatPhone.png",
        "imgs/zf_course.png", "imgs/zf_cubeBg.jpg",
        "imgs/zf_cubeTip.png", "imgs/zf_messageChat.png",
        "imgs/zf_messageKeyboard.png", "imgs/zf_outline.png",
        "imgs/zf_phoneDetail.png", "imgs/zf_phoneListen.png",
        "imgs/zf_return.png","imgs/face_img_left.png",
        "imgs/face_img_right.png","imgs/shangji_2.png",
        "imgs/zf_course.png","imgs/zf_course1.png",
        "imgs/zf_course2.png","imgs/zf_course3.png",
        "imgs/zf_course4.png","imgs/zf_course5.png",
        "imgs/zf_course6.png","imgs/zf_cube1.png",
        "imgs/zf_cube2.png","imgs/zf_cube3.png",
        "imgs/zf_cube4.png","imgs/zf_cube5.png",
        "imgs/zf_cube6.png","imgs/zf_messageArrow1.png",
        "imgs/zf_messageArrow2.png","imgs/zf_feng01.jpg",
        "imgs/zf_feng02.jpg","imgs/zf_feng03.jpg",
        "imgs/zf_messageChat.png","imgs/zf_messageLogo.png",
        "imgs/zf_messageStudent.png","imgs/zf_outline.png",
        "imgs/bell.mp3","imgs/music.mp3"
    ];
    var $loading = $('#loading'),
        $progress = $loading.children('.progress'),
        $span = $progress.children('span');
    var step = 0;
    total = fileAry.length;

    function loadingFn(){
        step++;
        oImg =null;//把新创建的图象对象释放
        $span.css('width', step / total*100 +'%');
        //所有图片都已经加载完毕：关闭LOADING,显示PHONE
        if(step === total){
            if(page === 0) return;
            window.setTimeout(function(){
                $loading.css('display','none');
                phoneRender.init();
            },2000);
        }
    }
    return{
        init: function(){
            $loading.css('display','block');
            //循环加载所有的图片，控制进度条的宽度
            $.each(fileAry,function(index ,item){

                var reg = /\.([a-zA-Z0-9]+)/i,
                    suffix = reg.exec(item)[1].toUpperCase();
                if (suffix === 'MP3') {
                    var oAudio = new Audio();
                    oAudio.src = item;
                    oAudio.onloadedmetadata = loadingFn;
                }else{
                    var oImg = new Image;
                    oImg.src = item;
                    oImg.onload = loadingFn(oImg);
                }
            });
        }
    }
})();

/*--PHONE--*/
var phoneRender = (function(){
    var $phone =$('#phone'),
        $listen = $phone.children('.listen'),
        $listenTouch = $listen.children('.touch'),
        $details = $phone.children('.detailWrap'),
        $detailsTouch = $details.find('.sonMore');

    var listenMusic = $('#listenMusic')[0];

    return{
        init:function(){
            $phone.css('display','block');
            listenMusic.play();
            $listenTouch.singleTap(function(){
                $listen.css('display','none');
                listenMusic.pause();
                $details.css('transform','translateY(0)');
            });
            //给了解详情加入单击事件
            $detailsTouch.singleTap(function(){
                $phone.css('transform','translateY('+document.documentElement.clientHeight+'px)')
                    .on('webkitTransitionEnd',function(){
                        $phone.css('display','none');
                        messageRender.init();
                    });
            });
        }
    }
})();

/**--MESSAGE--**/
var messageRender = (function(){
    var $message = $('#message'),
        $messageList = $message.children('.messageList'),
        $list = $messageList.children('li'),
        $keyBoard = $message.children('.keyBoard'),
        $textTip = $keyBoard.children('.textTip'),
        $submit  = $keyBoard.children('.submit'),
        $msgMusic = $('#msgMusic')[0];
    var autoTimer = null,
        step = -1,
        total= $list.length,
        bounceTop = 0;

    function messageMove(){
        autoTimer = window.setInterval(function(){
            step++;
            var $cur = $list.eq(step);
            $cur.css({
                opacity:1,
                transform:'translateY(0)'
            });
            //当发送完成第三条的时候，开启我们的键盘操作
            if(step === 2){
                window.clearInterval(autoTimer);
                $keyBoard.css('transform','translateY(0)');
                $textTip.css('display','block');
                textMove();
            }
            //从第四条开始，我们发送一条消息，都需要让整个消息区域往上移动相关的距离
            if(step >=3 ){
                bounceTop -= $cur[0].offsetHeight+10;
                $messageList.css('transform','translateY(' + bounceTop + 'px)')
            }
            //当消息发送完成
            if(step === total -1){
                window.clearInterval(autoTimer);
                window.setTimeout(function(){
                    if(page === 2) return;
                    $message.css('display','none');
                    $msgMusic.pause();
                    cubeRender.init();
                },1500);
            }
        },1500);
    }
    //textMove:实现文字打印机
    function textMove(){
        var text="啊，那是什么东西？",
            n=-1,
            result='';
        var textTimer = window.setInterval(function(){
            n++;
            result += text[n];
            $textTip.html(result);

            if(n === text.length-1){
                window.clearInterval(textTimer);
                $submit.css('display','block').singleTap(function(){
                    $textTip.css('display','none');
                    $keyBoard.css('transform','translateY(3.7rem)');
                    messageMove();
                });
            }
        },100);
    }
    return {
        init:function(){
            $message.css('display','block');
            messageMove();
            $msgMusic.play();
        }
    };
})();

/*--CUBE--*/
var cubeRender=(function(){
    var $cube = $('#cube'),
        $cubeBox = $cube.children('.cubeBox'),
        $cubeBoxList = $cubeBox.children('li');

    //滑动处理
    function isSwipe(changeX,changeY){
        return Math.abs(changeX)>30 || Math.abs(changeY) >30;
    }
    function start(ev){
        //手指可能有可个的所以它是一个集合，我要选取第一个
        var point = ev.touches[0];
        $(this).attr({
            strX:point.clientX,
            strY:point.clientY,
            changeX:0,
            changeY:0
        })
    }
    function move(ev){
        var point = ev.touches[0];
        var changeX = point.clientX - $(this).attr('strX'),
            changeY = point.clientY - $(this).attr('strY');
        $(this).attr({
            changeX: changeX,
            changeY: changeY
        });
    }
    function end(en){
        var changeX = parseFloat($(this).attr('changeX')),
            changeY = parseFloat($(this).attr('changeY'));
        var rotateX = parseFloat($(this).attr('rotateX')),
            rotateY = parseFloat($(this).attr('rotateY'));

        if(isSwipe(changeX,changeY)=== false) return;

        rotateX = rotateX - changeY/3;
        rotateY = rotateY + changeX/3;
        $(this).attr({
            rotateX: rotateX,
            rotateY: rotateY
        }).css('transform','scale(.6) rotateX('+ rotateX +'deg) rotateY('+rotateY+'deg)');
    }
    return{
        init:function(){
            $cube.css('display','block');

            $cubeBox.attr({
                rotateX:-35,
                rotateY:45
            }).on('touchstart',start).on('touchmove',move).on('touchend',end);

            //->每一面点击
            $cubeBoxList.singleTap(function(){
                var index = $(this).index();
                $cube.css('display','none');
                swiperRender.init(index);
            });
        }
    }
})();

/*--SWIPER--*/
var swiperRender = (function(){
    var $swiper =$('#swiper'),
        $makisu = $('#makisu'),
        $return = $('.return'),
        $sellTable=$(".sellTable");
    var data=[
        ['山鸡' , .62  ,'#ff7676'],
        ['黑山羊' , .47 ,''],
        ['五黑鸡' , .9 ,'#198CD2'],
        ['走地鸡' ,.76,'#E20C9F'],
        ['泥湫' , .35 ,'#8FBB4C']
    ];
    function componentBar(){
        $.each(data,function(index,item){
            var line = $('<li class="line">');
            var name = $('<div class="lineName">');
            var rate = $('<div class="rate">');
            var per = $('<div class="per">');

            var height = item[1]*100 + '%';

            var  bgStyle = '';
            if( item[2] ){
                bgStyle = 'style="background-color:'+item[2]+'"';
            }
            rate.html( '<div class="bg" '+bgStyle+'></div>' );
            rate.css('height',height);
            name.text( item[0]);
            per.text(height);
            rate.append(per);
            line.append( name ).append( rate );
            $sellTable.append(line);
        });
    }
    function change(example){
        var slidesAry =example.slides,
            activeIndex = example.activeIndex,
            $size = $sellTable.find('li').length;
        if(activeIndex === 0){
            $makisu.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            });
            $makisu.makisu('open');
        }else{
            $makisu.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0
            });
            $makisu.makisu('close');
        }

        if(activeIndex !== 3){
            $sellTable.empty();
        }else if(activeIndex === 3 && $size<=0){
            componentBar();
        }

        $.each(slidesAry, function(index , item){
            if(index === activeIndex){
                item.id = 'page'+ (activeIndex + 1);
                return;
            }
            item.id = null;
        });
    }
    return {
        init: function (index) {
            $swiper.css('display', 'block');
            //初始化SWIPER实现六个页面之间的切换
            var mySwiper =  new Swiper('.swiper-container', {
                effect: 'coverflow',
                onTransitionEnd: function (example) {
                    //只要当切换的操作结束不管是切换到一下个区域还是又回到了本区域，都会触发swiper内置的一个css3的切换动画，同样也会触发我们的onTransitionEnd这个回调函数执行
                    //example:是我们当前创建的swiper这个类的一个实例
                    //example.slides:记录了当前所有的SLIDE切换的块
                    //example.activeIndex:记录了当前正在展示的这一活动的块的索引
                    change(example);
                },
                onInit: function(example){
                    change(example);
                }
            });

            index = index || 0;
            //mySwiper.slideTo([index],[speed]):指定直接的运行到某一个区域
            mySwiper.slideTo(index, 0);

            $return.singleTap(function(){
                $swiper.css('display','none');
                $('#cube').css('display','block');
            });
        }
    }
})();

var urlObj = window.location.href.queryURLParameter();
page= parseFloat(urlObj['page']);

/*--调试使用--*/
if(page === 0 || isNaN(page)){
    loadingRender.init();
}else if(page ===1){
    phoneRender.init();
}else if(page === 2){
    messageRender.init();
}else if(page === 3){
    cubeRender.init();
}else if(page === 4 ){
    swiperRender.init(0)
}
