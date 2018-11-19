
$(document).scroll(function () {
    var s = $(document).scrollTop();
	var contHeight =$('nav').siblings('.container');
    if ( s > 0 && $(window).width() < 750) {
        $(".navbar").removeClass("navbar-fixed-top");
    }

    else if (s > 200 && $(window).width() >= 751 && contHeight.height() >=750) {
        $(".navbar").addClass("navbar-fixed-top");
        $(".navbar").addClass("animated fadeInDown");
        $("#logo-mob").removeClass("showmobile");
        $(".last-collapse").addClass("hide");

    }
    else {
        $(".navbar").removeClass("navbar-fixed-top");
        $(".navbar").removeClass("animated fadeInDown");
        $("#logo-mob").addClass("showmobile");
        $(".last-collapse").removeClass("hide");

    }

})

$( document ).ready(function() {
    $('.hide-footer').hide();

    $( ".action-footer" ).click(function(e) {
        e.preventDefault();
        $('.hide-footer').slideToggle();
    });


});

$(document).scroll(function () {
    var s = $(document).scrollTop();

    if ( s > 200 && $(window).width() < 1199) {
        $(".last-collapse").addClass("hide");
    }
    else {
        $(".last-collapse").removeClass("hide");


    }
});






jQuery(document).ready(function($){
    // browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 300,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('.cd-top');

    //hide or show the "back to top" link
    $(window).scroll(function(){
        ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if( $(this).scrollTop() > offset_opacity ) {
            $back_to_top.addClass('cd-fade-out');
        }
    });

    //smooth scroll to top
    $back_to_top.on('click', function(event){
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0 ,
            }, scroll_top_duration
        );
    });

});
