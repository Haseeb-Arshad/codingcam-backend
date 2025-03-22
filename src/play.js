Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  }
  return opts.inverse(this);
});

Handlebars.registerHelper('if_gt', function(a, b, opts) {
  if (a > b) {
    return opts.fn(this);
  }
  return opts.inverse(this);
});

Handlebars.registerHelper('if_lt', function(a, b, opts) {
  if (a < b) {
    return opts.fn(this);
  }
  return opts.inverse(this);
}); 

module.exports = Handlebars.compile(`
<div class="play-container">
    <div class="play-header">
        <div class="play-title">
            <h1>{{title}}</h1>
        </div>
        <div class="play-controls">
            <div class="play-control play-control-prev">
                <i class="fas fa-chevron-left"></i>
            </div>
            <div class="play-control play-control-next">
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    </div>
    {{#if video}}
    <div class="play-video">
        <video src="{{video}}" controls></video>
    </div>
    {{/if}}
    {{#if image}}
    <div class="play-image">
        <img src="{{image}}" alt="{{title}}">
    </div>
    {{/if}}
    <div class="play-footer">
        <div class="play-footer-left">
            <div class="play-footer-left-title">
                <h2>{{title}}</h2>
            </div>
            <div class="play-footer-left-description">
                <p>{{description}}</p>
            </div>
        </div>

        <!-- <div class="play-footer-right">
            <div class="play-footer-right-like">
                <i class="fas fa-heart"></i>
                <span>12</span>
            </div>
            <div class="play-footer-right-share">
                <i class="fas fa-share-alt"></i>
                <span>12</span>
            </div>
        </div> -->
    </div>
</div>
`);