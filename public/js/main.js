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
  articleBrowseList.querySelector('a').click();
}

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

function selectArticle (e) {
  articleBrowseList.querySelectorAll('a').forEach(link => link.className = '');
  e.target.className = 'active';
}

function openArticleFull () {
  
  let location = new URL(document.location);
  let articleURL = location.hash.split('/')
  articleIndex = articleURL[articleURL.length - 1];

  renderArticleFull();

  articleDialog.showModal();
}

function closeDialog() {
  console.log('close dialog')
  history.pushState({}, '', '#');
}

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
      
      articleDetailLink.click();
      openArticleFull();
    }
  }
}

window.addEventListener('load', async () => {
  await loadNewsletter();
  doNavigation();
});

window.addEventListener('hashchange', (e) => {
  console.log('navigeer')
  doNavigation();
});

articleDialog.addEventListener('close', closeDialog);

prevItemButton.addEventListener('click', () => {
  if(articleIndex > 0){
    articleIndex--;
  }
  // history.pushState({},'',`#article/${articleIndex}`);
  window.location = `#article/${articleIndex}`;
});

nextItemButton.addEventListener('click', () => {
  if(articleIndex < newsletter.articles.length - 1){
    articleIndex++;
  }

  // history.pushState({name: 'test'},'',`#article/${articleIndex}`);
  window.location = `#article/${articleIndex}`;
})