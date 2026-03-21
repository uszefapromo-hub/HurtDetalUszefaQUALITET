
let products=[]
let cart=[]

function go(route){
  location.hash=route
  render()
}

function render(){
  const route=location.hash.replace('#','')||'home'
  const app=document.getElementById('app')

  if(route==='home'){
    app.innerHTML='<h2>Start</h2>'
  }

  if(route==='shop'){
    app.innerHTML='<div class="grid">'+products.map(p=>`
      <div class="card">
        <img src="${p.img}" width="100%">
        <h3>${p.name}</h3>
        <p>${p.price} zł</p>
        <button onclick="add(${p.id})">Kup</button>
      </div>
    `).join('')+'</div>'
  }

  if(route==='cart'){
    app.innerHTML='<h2>Koszyk</h2>'+cart.map(p=>p.name).join('<br>')
  }
}

function add(id){
  const p=products.find(x=>x.id===id)
  cart.push(p)
  alert('Dodano')
}

fetch('https://dummyjson.com/products?limit=30')
.then(r=>r.json())
.then(d=>{
  products=d.products.map(p=>({
    id:p.id,
    name:p.title,
    price:p.price,
    img:p.thumbnail
  }))
  render()
})

window.onhashchange=render
render()
