import "./App.css";
import Input from "./components/Input";
import Sidebar from "./components/Sidebar";
import Chat, { WaitingStates } from "./components/Chat";
import React, { useState, useEffect  } from "react";
import Config from "./config";
import { useLocalStorage } from "usehooks-ts";

export type MessageDict = {
  text: string;
  role: string;
  type: string;
};

function App() {
  const COMMANDS = ["reset"];

  let [MODELS, setModels] = useState([{displayName: "GPT-3.5", name: "gpt-3.5-turbo"}]);

  useEffect(() => {
    const getModels = async () => {
      try {
        const response = await fetch(`${Config.WEB_ADDRESS}/models`);
        const json = await response.json();
        setModels(json);
      } catch (e) {
        console.error(e);
      };
    };

    getModels();
 }, []);

  let [selectedModel, setSelectedModel] = useLocalStorage<string>(
    "model",
    MODELS[0].name
  );

  let [openAIKey, setOpenAIKey] = useLocalStorage<string>("OpenAIKey", "");

  let [messages, setMessages] = useState<Array<MessageDict>>(
    Array.from([
      {
        text: "Hello! How Can I help you?",
        role: "generator",
        type: "message",
      },
      // {
      //   text: "If I get stuck just type 'reset' and I'll restart the kernel.",
      //   role: "generator",
      //   type: "message",
      // },
    ])
  );
  let [waitingForSystem, setWaitingForSystem] = useState<WaitingStates>(
    WaitingStates.Idle
  );
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  const submitCode = async (code: string) => {
    fetch('', {  // Replace `${Config.API_ADDRESS}/api` with ''
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command: code }),
    })
      .then(() => {})
      .catch((error) => console.error("Error:", error));
  };

  const addMessage = (message: MessageDict) => {
    setMessages((state: any) => {
      return [...state, message];
    });
  };

  const handleCommand = (command: string) => {
    if (command == "reset") {
      addMessage({ text: "Restarting the kernel.", type: "message", role: "system" });

      fetch('', {  // Replace `${Config.API_ADDRESS}/restart` with ''
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
        .then(() => {})
        .catch((error) => console.error("Error:", error));
    }
  };

  // const sendMessage = async (userInput: string) => {
  //   try {
  //     if (COMMANDS.includes(userInput)) {
  //       handleCommand(userInput);
  //       return;
  //     }
  
  //     if (userInput.length === 0) {
  //       return;
  //     }
  
  //     addMessage({ text: userInput, type: "message", role: "user" });
  //     setWaitingForSystem(WaitingStates.GeneratingCode);
  
  //     const api_url = 'https://flowvisorfuncapp.azurewebsites.net/api/visualize_flow';
  //     const queryParams = `?query=${encodeURIComponent(userInput)}`;
  
  //     const response = await fetch(api_url + queryParams, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  
  //     if (response.status !== 200) {
  //       setWaitingForSystem(WaitingStates.Idle);
  //       return;
  //     }
  
  //     const textResponse = await response.text(); // Read the response as plain text
  
  //     // Check if the response contains SVG content
  //     const svgMatch = /<svg[^>]*>[\s\S]*<\/svg>/i.exec(textResponse);
  
  //     if (svgMatch) {
  //       // Extract the SVG content
  //       const svgContent = svgMatch[0];
  //       // Render the extracted SVG content as an SVG element
  //       addMessage({ text: svgContent, type: "image/svg", role: "generator" });
  //     } else {
  //       // If no SVG content found, treat it as regular text
  //       addMessage({ text: textResponse, type: "message", role: "generator" });
  //     }
  
  //     // Handle the rest of your code as needed
  //   } catch (error) {
  //     console.error("There has been a problem with your fetch operation:", error);
  //   }
  // };

  const sendMessage = async (userInput: string) => {
    try {
      if (COMMANDS.includes(userInput)) {
        handleCommand(userInput);
        return;
      }
  
      if (userInput.length === 0) {
        return;
      }
  
      addMessage({ text: userInput, type: "message", role: "user" });
      setWaitingForSystem(WaitingStates.GeneratingCode);
  
      const api_url = 'https://flowvisorfuncapp.azurewebsites.net/api/visualize_flow';
      const queryParams = `?query=${encodeURIComponent(userInput)}`;
  
      const response = await fetch(api_url + queryParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status !== 200) {
        setWaitingForSystem(WaitingStates.Idle);
        return;
      }
  
      const textResponse = await response.text(); // Read the response as plain text
  
      // Check if the response contains SVG content
      const svgMatch = /<svg[^>]*>[\s\S]*<\/svg>/i.exec(textResponse);
  
      if (svgMatch) {
        // Extract the SVG content
        const svgContent = svgMatch[0];
  
        // Create a DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");
  
        // Check if the SVG element exists
        const svgElement = doc.querySelector("svg");
        if (svgElement) {
          // Modify the SVG attributes (e.g., set the height)
          svgElement.setAttribute("height", "380.4pt");
  
          // Convert the modified SVG back to a string
          const modifiedSvgContent = new XMLSerializer().serializeToString(doc);
  
          // Render the modified SVG content as an SVG element
          addMessage({ text: modifiedSvgContent, type: "image/svg", role: "generator" });
        } else {
          // If the SVG element is not found, treat it as regular text
          addMessage({ text: textResponse, type: "message", role: "generator" });
        }
      } else {
        // If no SVG content found, treat it as regular text
        addMessage({ text: textResponse, type: "message", role: "generator" });
      }
  
      // Handle the rest of your code as needed
    } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
    }
  };
  
    
  
  
  
  async function getApiData() {
    if(document.hidden){
      return;
    }
    
    let response = await fetch('', {  // Replace `${Config.API_ADDRESS}/api` with ''
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let data = await response.json();
    data.results.forEach(function (result: {value: string, type: string}) {
      if (result.value.trim().length == 0) {
        return;
      }

      addMessage({ text: result.value, type: result.type, role: "system" });
      setWaitingForSystem(WaitingStates.Idle);
    });
    
  }

  function completeUpload(message: string) {
    addMessage({ text: message, type: "message", role: "upload" });
    setWaitingForSystem(WaitingStates.Idle);

    // Inform prompt server
    fetch(`${Config.WEB_ADDRESS}/inject-context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: message,
      }),
    })
      .then(() => {})
      .catch((error) => console.error("Error:", error));
  }

  function startUpload(_: string) {
    setWaitingForSystem(WaitingStates.UploadingFile);
  }

  React.useEffect(() => {
    const interval = setInterval(getApiData, 1000);
    return () => clearInterval(interval);
  }, [getApiData]);

  React.useEffect(() => {
    // Scroll down container by setting scrollTop to the height of the container
    chatScrollRef.current!.scrollTop = chatScrollRef.current!.scrollHeight;
  }, [chatScrollRef, messages]);


  // Capture <a> clicks for download links
  React.useEffect(() => {
    const clickHandler = (event: any) => {
      let element = event.target;
      
      // If an <a> element was found, prevent default action and do something else
      if (element != null && element.tagName === 'A') {
        // Check if href starts with /download
        
        if (element.getAttribute("href").startsWith(`/download`)) {
          event.preventDefault();

          // Make request to ${Config.WEB_ADDRESS}/download instead
          // make it by opening a new tab
          window.open(`${Config.WEB_ADDRESS}${element.getAttribute("href")}`);
        }        
      }
    };

    // Add the click event listener to the document
    document.addEventListener('click', clickHandler);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('click', clickHandler);
    };
  }, []); 

  return (
    <>
      <div className="app">
        <Sidebar
          models={MODELS}
          selectedModel={selectedModel}
          onSelectModel={(val: string) => {
            setSelectedModel(val);
          }}
          openAIKey={openAIKey}
          setOpenAIKey={(val: string) => {
            setOpenAIKey(val);
          }}
        />
        <div className="main">
          <Chat
            chatScrollRef={chatScrollRef}
            waitingForSystem={waitingForSystem}
            messages={messages}
          />
          <Input
            onSendMessage={sendMessage}
            onCompletedUpload={completeUpload}
            onStartUpload={startUpload}
          />
        </div>
      </div>
    </>
  );
}

export default App;
