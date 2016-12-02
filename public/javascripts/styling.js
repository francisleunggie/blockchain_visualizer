$( document ).ready( function( ) {
	/*$.fn.qtip.styles.tooltipDefault = {
		background  : '#132531',
		color       : '#FFFFFF',
		textAlign   : 'left',
		border      : {
			width   : 2,
			radius  : 4,
			color   : '#C1CFDD'
		},
		width       : 220
	}*/
	$.scrollify({
		section : "section",
		sectionName : "section-name",
		interstitialSection : "",
		easing: "easeOutExpo",
		scrollSpeed: 1100,
		offset : 0,
		scrollbars: true,
		standardScrollElements: "",
		setHeights: true,
		overflowScroll: true,
		before:function() {},
		after:function() {},
		afterResize:function() {},
		afterRender:function() {}
	});
	
	$(function() {
		$.scrollify({
			section : ".scroller",
		});
	});
} );



