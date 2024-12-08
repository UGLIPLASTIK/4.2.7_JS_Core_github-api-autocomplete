const input = document.querySelector('input');
const dropList = document.querySelector('.drop-list');
const itemCollection = document.querySelector('.item-collection');

const debounce = function(fn, ms) {
  let timeout;
  return function wrapper() {
    const fnCall = () => { fn.apply(this, arguments) }
    clearTimeout(timeout); 
    timeout = setTimeout(fnCall, ms)
  }
}

const findRepo = debounce(function() {
  let searchWord = undefined;
  if (input.value.length === 0) return
  searchWord = input.value.trim();
  if(searchWord.length === 0) return

  const createListItem = function(item, where) {
    if (where === 'drop-list') {
      const listItem = document.createElement('li');
      listItem.classList.add('drop-list__item');
      listItem.textContent = item.language;
      listItem.addEventListener('click', (e) => {
        itemCollection.insertAdjacentElement('beforeend', createListItem(item));
        input.value = '';
        dropList.innerHTML = '';
      })
      return listItem;
    } else {
      const listItem = document.createElement('li');
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete_btn');
      function deleteListItem(event) {
        event.target.closest('li').remove();
        this.removeEventListener('click', deleteListItem)
      }
      deleteBtn.addEventListener('click', deleteListItem)
      for (key in item) {
        const info = document.createElement('span')
        info.classList.add('list-item-info');
        info.textContent = `${key}: ${item[key]}`;
        listItem.insertAdjacentElement('beforeend', info);
      }
      listItem.insertAdjacentElement('beforeend', deleteBtn);
      return listItem;
    }
  }

  fetch('https://api.github.com/search/repositories?q=Q&per_page=10')
  .then(response => response.json())
  .then(data => {
    const allRepo = data.items.reduce((acc, item) => {
      const repo = {}
      const { language, stargazers_count } = item;
      const { login } = item.owner
      repo.language = language
      repo.stars = stargazers_count
      repo.name = login
      acc.push(repo);
      return acc
    }, [])
    allRepo.filter(el => el.language.toLowerCase().startsWith(searchWord)).slice(0, 5).forEach(element => {
      dropList.insertAdjacentElement('beforeend', createListItem(element, 'drop-list'))
    });
  })
}, 600)

input.addEventListener('keyup', (e) => {
  dropList.innerHTML = '';
  findRepo()
})