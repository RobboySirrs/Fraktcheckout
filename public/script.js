const loaderRing = document.getElementById("laddar")
const orderButton = document.getElementById("order")


const visaKlar = async () => document.getElementById("order").style.visibility = "visible";
                        document.getElementById("varubrevval").innerHTML = "<option>" + "Brevl&aring;dan" + "</option>";

        const visa = () => {
      
let q = document.querySelector('input[name="frakt"]:checked').value;
let p = document.getElementById(q);
let e = p;
let value = e.value;
let text = e.options[e.selectedIndex].text;
const frakt = q.charAt(0).toUpperCase() + q.slice(1, -3);


alert("Du har valt att få ditt paket levererat \nMed: " + frakt + "\nTill: " + text);
}
        let input = document.getElementById("myText");
        let kNummer2 = 0;

        

        input.addEventListener("keyup", async (event) => {
          if (event.target.value.length === 5) {
            document.getElementById("order").disabled = true;

            hittaPost(input.value, kNummer2);
             

          }
        });

    

        const hittaPost = async (a, b) => {    
          //Fel Postnummer?
          let postnummer = 0;
          document.getElementById("fel").innerHTML = "";  
          
          //if same number do nothing
          if (a == b) {
           document.getElementById("order").disabled = false;
           return;

            
          } else {
            
            kNummer2 = a;
           orderButton.style.visibility = "hidden";
           orderButton.disabled = false;
            loaderRing.style.visibility = "visible";
          
            //Clean Radio buttons on new search..
          let ele = document.getElementsByName("frakt");
          ele.forEach(x => x.checked = false);
          }
        
          
          
          const response = await fetch(`/api/${a}`);
            const data = await response.json();
         const postNord = document.getElementById("postnord")
        const varuBrev = document.getElementById("varubrev")
           


//POSTNORD
          
          if (data.post == "fel")     {
          postnummer += 1
          postNord.style.display = "none";
          varuBrev.style.display = "none";


          } else {
            
                                    
              document.getElementById("postnordval").innerHTML = data.post;         
              postNord.style.display = "block"; 
              varuBrev.style.display = "block";

              
                            
    } 


//BUDBEE
         const budBee = document.getElementById("budbee")
          if (data.bud == "fel")  {
            postnummer += 1
            budBee.style.display = "none";
          } else {
                                          
              
              document.getElementById("budbeeval").innerHTML = data.bud;         
              budBee.style.display = "block"; 
 
                             
    } 
//INSTABOX
          const instaBox = document.getElementById("instabox");
         
          
          if (data.ins == "fel") {
            postnummer += 1
            instaBox.style.display = "none";

          } else {
                                          
              
              document.getElementById("instaboxval").innerHTML = data.ins;         
              instaBox.style.display = "block";
                              
    }   ///HÄR KAN VI GÖRA EFTER ALLT!
     if (postnummer >= 3) {
          document.getElementById("fel").innerHTML = "Fel Postnummer?";
          
          } else {
          document.getElementById("fel").innerHTML = "";  
          
          }   
          

          document.getElementById("laddar").style.visibility = "hidden";

        }; //stänga
      
