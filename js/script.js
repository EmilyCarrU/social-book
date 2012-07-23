$(".target_com").click(function () {
	/* $(this).toggleClass("com__open"); */
	$(this).children(":first").toggleClass("com__open");
});

$(".chap_marg").click(function () {
	$(this).next().toggleClass("temp_citation_modal__open");
	/* Change this, right now it will apply the class to the
	next element even if they are not .temp_citation_modal */
});