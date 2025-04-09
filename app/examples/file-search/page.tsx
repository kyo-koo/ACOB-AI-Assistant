"use client";
import React from "react";
import styles from "../shared/page.module.css";

import Chat from "../../components/chat";
//import FileViewer_Copy from "../../components/file-viewer_copy";

const FileSearchPage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FileSearchPage;
