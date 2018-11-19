//MOVE TO TOP
jQuery(document).ready(function (e) {
    var l = 400,
        t = 1200,
        a = 700,
        i = e(".move-to-top");
    e(window).scroll(function () {
        e(this).scrollTop() > l ? i.addClass("cd-is-visible") : i.removeClass("cd-is-visible cd-fade-out"), e(this).scrollTop() > t && i.addClass("cd-fade-out")
    }), i.on("click", function (l) {
        l.preventDefault(), e("body,html").animate({
            scrollTop: 0
        }, a)
    })
});