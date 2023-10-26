const articleBrowseList = document.querySelector('aside ul.article-cards');
const fpArticleList = document.querySelector('main section')
const fpArticleTemplate = document.querySelector("template.fp-article");
const browseArticleTemplate = document.querySelector("template.article-card");
const articleDialog = document.querySelector('dialog');
const prevItemButton = articleDialog.querySelector('button[prev]');
const nextItemButton = articleDialog.querySelector('button[next]');

let newsletter;
let articleIndex = 0;

async function loadNewsletter() {
  const response = await fetch('./data/edition-1.json');
  newsletter = await response.json();

  newsletter.articles.forEach( (element,index) => {
    articleBrowseList.appendChild(renderArticleBrowseListItem(element, index));
    fpArticleList.appendChild(renderArticlePreview(index));
  });
  
  // select first thumbnail item 
  // (a *little* redundant tbh, but it'll highlight the item in the thumbnail grid)
  articleBrowseList.querySelector('a').click();
}

// renders scrollable article thumbnail grid on the right
function renderArticleBrowseListItem(element, index) {
  const template = browseArticleTemplate.content.cloneNode(true);
  const li = template.querySelector('li');
  const a = template.querySelector('a');
  const img = template.querySelector('img');
  const span = template.querySelector('span');
  const strong = template.querySelector('strong');

  li.style.setProperty('--delay', index);
  a.href = `#article-preview-${index}`;
  a.addEventListener('click', selectArticle);
  img.src = `${element.media.poster ? element.media.poster.src : element.media.hero.src}`;
  img.alt = `${element.media.poster ? element.media.poster.alt : element.media.hero.alt}`;
  img.className = 'bg-secondary-shade';
  img.loading = 'lazy';

  strong.textContent = element.tags.join(', ');
  span.textContent = element.teaser;

  return li;
}

// renders large scrollable list of article previews on the left hand side of the page
function renderArticlePreview (index) {
  const template = fpArticleTemplate.content.cloneNode(true);
  const article = template.querySelector('article');
  const img = template.querySelector('img');
  const h2 = template.querySelector('h2')
  const subheading = template.querySelector('blockquote');
  const link = template.querySelector('a');
  const video = template.querySelector('video');
  const item = newsletter.articles[index];

  article.id = `article-preview-${index}`;
  img.src = item.media.hero?.src ? item.media.hero.src : item.media.poster.src;
  h2.textContent = item.title;
  subheading.innerHTML = JSON.parse(JSON.stringify(item.intro));
  link.href = `#article/${index}`;
  link.textContent = 'Read more...'

  if(!item.media.video.src) {
    video.remove();
  } else {
    video.setAttribute('poster', img.src);
    video.src = item.media.video.src;
  }

  return template;
}

// renders article in dialog element
function renderArticleFull () {
  //article navigation housekeeping
  if(articleIndex <= 0) {
     prevItemButton.setAttribute('disabled', 'disabled')
  } else {
    prevItemButton.removeAttribute('disabled')
  }

  if (articleIndex >= newsletter.articles.length - 1 ) {
    nextItemButton.setAttribute('disabled', 'disabled')
  } else {
    nextItemButton.removeAttribute('disabled')
  }

  // place content
  let currentArticle = newsletter.articles[articleIndex];
  articleDialog.querySelector('article .hero img').src = currentArticle.media.hero?.src ? currentArticle.media.hero.src : currentArticle.media.poster.src;
  articleDialog.querySelector('article .hero img').alt = currentArticle.media.hero?.alt ? currentArticle.media.hero.alt : currentArticle.media.poster.alt;
  articleDialog.querySelector('article h1').textContent = currentArticle.title;
  articleDialog.querySelector('article blockquote').innerHTML = currentArticle.intro;
  articleDialog.querySelector('article .body').innerHTML = currentArticle.content;
}

// highlights thumbnail grid item
function selectArticle (e) {
  articleBrowseList.querySelectorAll('a').forEach(link => link.className = '');
  e.target.className = 'active';
}

// selects article fro URL, has it rendered and opens the dialog it's rendered into
function openArticleFull () {
  // links from the item preview will generate an article url like `#article/1`
  let location = new URL(document.location);
  let articleURL = location.hash.split('/')

  // setting a global to the selected article index
  articleIndex = articleURL[articleURL.length - 1];

  // put stuff in place
  renderArticleFull();

  // reveal content
  articleDialog.showModal();
}

// y'know
function closeDialog() {
  // this is less elegant than I'd hoped for
  history.pushState({}, '', '#');
}

// finds URL hash and depending on it's state, scrolls towards anchor
// or opens full article dialog
function doNavigation () {
  let url = new URL(document.location);
  let articleHash = url.hash;
  if(!articleHash) {
    return;
  } else {
    // scroll preview into view
    if(articleHash.includes('preview')) {
      document.querySelector(`[href="${articleHash}"]`).click();
      document.querySelector(articleHash).scrollIntoView();
      document.querySelector('dialog').close();
    } else {
      // open article detail
      let articleDetailLink = document.querySelector(`[href="${articleHash}"]`);
      
      // clicks the link, adding the hash to the page url (which doesn't match with a page anchor, so..)
      articleDetailLink.click();
      // open article in dialog
      openArticleFull();
    }
  }
}

// the business
window.addEventListener('load', async () => {
  await loadNewsletter();
  doNavigation();
});

// the hustle
window.addEventListener('hashchange', (e) => {
  doNavigation();
});

// the muscle
articleDialog.addEventListener('close', closeDialog);

prevItemButton.addEventListener('click', () => {
  if(articleIndex > 0){
    articleIndex--;
  }
  // not sure what's up with these guys,
  // seems convoluted or something
  // history.pushState({},'',`#article/${articleIndex}`);
  window.location = `#article/${articleIndex}`;
});

nextItemButton.addEventListener('click', () => {
  if(articleIndex < newsletter.articles.length - 1){
    articleIndex++;
  }

  // history.pushState({name: 'test'},'',`#article/${articleIndex}`);
  window.location = `#article/${articleIndex}`;
});