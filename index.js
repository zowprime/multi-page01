// Variable that contains the location of the pages
var PageLoc = "./Pages"

// Variables for A-FRAME related to the scene
var SceneData = $("a-scene")  // Selects the A-Frame scene element
var scene     = SceneData[0]  // Gets the first A-Frame scene element
var MainScene = $("#MainScene")[0]  // Gets the main scene element with the ID "MainScene"

// Contains the name of the document in a variable
let PathName = location.pathname.split("/")  // Splits the URL path into an array
PathName = (PathName[PathName.length - 1].split(".")[0] || "index").toUpperCase()  // Gets the last part of the path, removes the file extension, and converts it to uppercase. Defaults to "INDEX" if no file name is found.

// Function to wait for x milliseconds
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Function that removes the "cache" from the camera
async function UpdateNavigator() {
    await sleep(100)  // Waits for 100 milliseconds
    $("#cur_camera")[0].emit("end_trans")  // Emits the "end_trans" event to the current camera element
}

// Interaction for the UpdateNavigator function, when the template is loaded
if(MainScene) MainScene.addEventListener("templaterendered", UpdateNavigator)  // Adds an event listener to call UpdateNavigator when the template is rendered

// Function that changes the scene based on the given name
async function SwitchArea(Name) {
    let ok = document.querySelectorAll(".field")  // Selects all elements with the class "field"

    // Removes all elements with the class "field"
    ok.forEach(function(val) { $(val).remove() })

    $("#cur_camera")[0].emit("start_trans")  // Emits the "start_trans" event to the current camera element
    await sleep(500)  // Waits for 500 milliseconds
  
    // Changes the scene to the value of the template
    MainScene.attributes.template.nodeValue = "src: " + PageLoc + "/" + PathName + "/" + Name + ".html"
}

// Initialization of the scene
AFRAME.registerComponent('scene-init', {
    schema: {type: 'string', default: 'default'},  // Defines a schema with a string type and a default value
    init: async function() {
      this.SceneName = this.data  // Gets the name of the scene from the schema

      SwitchArea(this.SceneName)  // Calls the SwitchArea function with the scene name
    }
  })  

// Button that changes the scene to the predefined value
AFRAME.registerComponent('scene-changer', {
    schema: {type: 'string', default: 'default'},  // Defines a schema with a string type and a default value
  
    init: async function() {
      this.onClick = this.onClick.bind(this)  // Binds the onClick function to the current context
      this.SceneName = this.data  // Gets the name of the scene from the schema

      //  Activates the event when a click is detected
      this.el.addEventListener("click", this.onClick)  // Adds an event listener to call onClick when the element is clicked
    },
  
    onClick: async function() {
      SwitchArea(this.SceneName)  // Calls the SwitchArea function with the scene name
    }
  })

 document.addEventListener('DOMContentLoaded', function() {
      const videoElement = document.querySelector('#PROMENADE');
      const changerButton = document.querySelector('#changer');
      
      // Quando o vídeo terminar
      videoElement.addEventListener('ended', function() {
        // Mostra o botão com animação
        changerButton.setAttribute('visible', 'true');
        changerButton.emit('showButton');
        
        // Altera comportamento: ao clicar vai para 2.html
        changerButton.addEventListener('click', function() {
          window.location.href = '2.html';
        });
      });
    });
