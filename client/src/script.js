
$(window).resize(function() {
    if (document.body.clientWidth >= 992) {
        $("[data-bs-toggle='collapse']").attr("data-bs-toggle","non-collapse");
    } else {
        $("[data-bs-toggle='non-collapse']").attr("data-bs-toggle","collapse");
    }
});


$(window).on("load", function() {
    if (document.body.clientWidth >= 992) {
        $("[data-bs-toggle='collapse']").attr("data-bs-toggle","non-collapse");
    } else {
        $("[data-bs-toggle='non-collapse']").attr("data-bs-toggle","collapse");
    }
});
