// Variable that contains the location of the pages
var PageLoc = "./Pages"

// Variables for A-FRAME that concern the scene
var SceneData = $("a-scene") // Select the A-FRAME scene element using jQuery
var scene     = SceneData[0] // Get the first element from the selected scene elements
var MainScene = $("#MainScene")[0] // Select the element with id "MainScene"

// Contains the name of the document in a variable
let PathName = location.pathname.split("/") // Split the URL path into an array
PathName = (PathName[PathName.length - 1].split(".")[0] || "index").toUpperCase() // Get the last part of the path, split by dot to remove extension, default to "index", and convert to uppercase

// Function to wait for a specified number of milliseconds
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Function that removes the "cache" from the camera
async function UpdateNavigator() {
    await sleep(100) // Wait for 100 milliseconds
    $("#cur_camera")[0].emit("end_trans") // Emit an event to the camera element to end the transition
}

// Interaction for the UpdateNavigator function when the template is loaded
if(MainScene) MainScene.addEventListener("templaterendered", UpdateNavigator)

// Function to change the scene based on the given name
async function SwitchArea(Name) {
    let ok = document.querySelectorAll(".field") // Select all elements with class "field"

    // Remove all elements of the class "field"
    ok.forEach(function(val) { $(val).remove() })

    $("#cur_camera")[0].emit("start_trans") // Emit an event to the camera element to start the transition
    await sleep(500) // Wait for 500 milliseconds
  
    // Change the scene by setting the value of the template attribute
    MainScene.attributes.template.nodeValue = "src: " + PageLoc + "/" + PathName + "/" + Name + ".html"
}

// Initialization of the scene
AFRAME.registerComponent('scene-init', {
    schema: {type: 'string', default: 'default'}, // Define a schema with a default value
    init: async function() {
      this.SceneName = this.data // Store the schema data in a variable

      SwitchArea(this.SceneName) // Call the SwitchArea function with the scene name
    }
})  

// Button component that changes the scene to the predefined value
AFRAME.registerComponent('scene-changer', {
  schema: {type: 'string', default: 'default'}, // Define a schema with a default value

  init: async function() {
    this.onClick = this.onClick.bind(this) // Bind the onClick function to the current context
    this.SceneName = this.data // Store the schema data in a variable

    // Activate the event if a click is detected
    this.el.addEventListener("click", this.onClick)
  },

  onClick: async function() {
    SwitchArea(this.SceneName) // Call the SwitchArea function with the scene name
  }
})

// Variable to display a panel only at the start of the site
var ok = false
AFRAME.registerComponent('hide', {
  init: async function() {
    if(ok) this.el.setAttribute('visible', false); // If ok is true, set the element to invisible
    this.onClick = this.onClick.bind(this) // Bind the onClick function to the current context

    // Activate the event if a click is detected
    this.el.addEventListener("click", this.onClick)
  },
  onClick: async function() {
    ok = true // Set ok to true
    this.el.setAttribute('visible', false) // Set the element to invisible
  }
})

// Component to display text in a specific way
AFRAME.registerComponent('tang', {
  schema: {
    angle: {type: 'int', default: 0}, // Define an angle property with default value 0
    rad: {type: 'int', default: 4}, // Define a radius property with default value 4
    Y: {type: 'int', default: 1} // Define a Y position property with default value 1
  },

  init: async function() {
    this.update = this.update.bind(this) // Bind the update function to the current context
  },

  update: async function() {  
    console.log("update")
    // ------ \\
    let container = $("#navigation")[0] // Select the element with id "navigation"
    let angle = this.data["angle"] / (180 / Math.PI), // Convert the angle from degrees to radians
        radius = container.getAttribute("radius-outer") * this.data.rad // Calculate the radius using the outer radius attribute and the rad property
    let x = ( radius ) * Math.cos(angle), // Calculate the x position
        z = ( radius ) * Math.sin(angle); // Calculate the z position 
  
    this.el.setAttribute("position", {"x": x, "y": container.getAttribute("position").y + this.data["Y"], "z": z}) // Set the position of the element
    
    this.el.object3D.lookAt(container.getAttribute("position")) // Make the element look at the container's position
    this.el.setAttribute("visible", "true") // Make the element visible
  },
})
