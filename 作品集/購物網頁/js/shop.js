const products = [
  { name: "SoundLab Pro", price: 5980 },
  {name:"SoundLab Air",price:3980},
  {name:"SoundLab Mini",price:2680},
]
const buttonPro=document.getElementById("Pro")
const buttonAir=document.getElementById("Air")
const buttonMini=document.getElementById("Mini")
let cart=[]
const productList =document.querySelector(".product-list")
function renderProduct(data){
    const html=data.map(function(item){
        return`
        
        <div class="card">
        <h2>${item.name}</h2>
        <p>NT$${item.price}</p>
        <button>加入購物車</button></div>
        `
    })
    productList.innerHTML=html.join("");
}

renderProduct(products)
