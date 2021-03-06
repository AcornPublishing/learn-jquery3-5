$.ajaxSetup({
  accepts: {
    yaml: 'application/x-yaml, text/yaml'
  },
  contents: {
    yaml: /yaml/
  },
  converters: {
    'text yaml': (textValue) => YAML.eval(textValue)
  }
});

Promise.all([
  $.getScript('yaml.js')
    .then(() =>
      $.ajax({
        url: 'categories.yml',
        dataType: 'yaml'
      })),
  $.ready
]).then(function([data]) {
  const output = Object.keys(data).reduce((result, key) =>
    result.concat(
      `<li><strong>${key}</strong></li>`,
      data[key].map(i => `<li> <a href="#">${i}</a></li>`)
    ),
    []
  ).join('');

  $('#categories')
    .removeClass('hide')
    .html(`<ul>${output}</ul>`);
});

$(() => {
  const buildItem = item =>
    `
      <li>
        <h3><a href="${item.html_url}">${item.name}</a></h3>
        <div>★ ${item.stargazers_count}</div>
        <div>${item.description}</div>
      </li>
    `;

  const cache = new Map();

  $('#ajax-form')
    .on('submit', (e) => {
      e.preventDefault();

      const search = $('#title').val();

      if (search == '') {
        return;
      }

      $('#response')
        .addClass('loading')
        .empty();

      cache.set(search, cache.has(search) ?
        cache.get(search) :
        $.ajax({
          url: 'https://api.github.com/search/repositories',
          dataType: 'jsonp',
          data: { q: search },
          timeout: 10000,
        })
      ).get(search).then((json) => {
        var output = json.data.items.map(buildItem);
        output = output.length ?
          output.join('') : 'no results found';

        $('#response').html(`<ol>${output}</ol>`);
      }).catch(() => {
        $('#response').html('Oops. Something went wrong...');
      }).always(() => {
        $('#response').removeClass('loading');
      });
    });

  const searchDelay = 300;
  var searchTimeout;

  $('#title')
    .on('keyup', (e) => {
      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        $(e.target.form).triggerHandler('submit');
      }, searchDelay);
    });
});
