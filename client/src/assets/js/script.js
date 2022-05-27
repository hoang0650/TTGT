(function($){
    $(window).on('scroll', function () {
		//.Scroll to top show/hide
    var scrollToTop = $('.scroll-top-to'),
      scroll = $(window).scrollTop();
    if (scroll >= 200) {
      scrollToTop.fadeIn(200);
    } else {
      scrollToTop.fadeOut(100);
    }
  });
	// scroll-to-top
    $('.scroll-top-to').on('click', function () {
    $('body,html').animate({
      scrollTop: 0
    }, 200);
    return false;
  });
})(jQuery);