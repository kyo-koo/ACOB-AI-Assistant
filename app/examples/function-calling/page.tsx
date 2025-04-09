"use client";

import React, { useState } from "react";
import styles from "../shared/page.module.css";
import Chat from "../../components/chat";
import FileViewer from "../../components/file-viewer";
import CodeInterpreter from "../../components/codeInterpreter";

//import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";


const FunctionCalling = () => {
  


  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
        
          <FileViewer />
          <CodeInterpreter />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FunctionCalling;
