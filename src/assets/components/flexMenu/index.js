/**
 * Created by r9luox on 2016/7/14.
 */

$(function(){
    $('.flex-content').hover(function(){
        $(this).parents('.flex-menu-box').css({
            'overflow': 'visible'
        });
    }, function(){
        $(this).parents('.flex-menu-box').css({
            'overflow': 'hidden'
        });
    });
});
