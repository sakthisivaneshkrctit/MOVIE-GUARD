import React, { useState } from 'react';
import { Code2, Copy, Check, FileText, Download, X, FolderTree, Server, Terminal } from 'lucide-react';

interface JavaFile {
  name: string;
  path: string;
  category: 'Controller' | 'Model' | 'Store' | 'Config' | 'Application';
  code: string;
}

const JAVA_PROJECT_FILES: JavaFile[] = [
  {
    name: 'MovieGuardApplication.java',
    path: 'src/main/java/com/movieguard/MovieGuardApplication.java',
    category: 'Application',
    code: `package com.movieguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Movie Guard - Secure Personal Media Library Application
 * Main Spring Boot Entry Point.
 */
@SpringBootApplication
public class MovieGuardApplication {

    public static void main(String[] args) {
        SpringApplication.run(MovieGuardApplication.class, args);
        System.out.println("\\n=======================================================");
        System.out.println("  MOVIE GUARD SECURITY SYSTEM IS ACTIVE  ");
        System.out.println("  Access Web Portal: http://localhost:8080");
        System.out.println("=======================================================\\n");
    }
}`
  },
  {
    name: 'User.java',
    path: 'src/main/java/com/movieguard/model/User.java',
    category: 'Model',
    code: `package com.movieguard.model;

import java.time.LocalDateTime;

public class User {
    private String id;
    private String name;
    private String email;
    private String password;
    private int age;
    private String webcamPhotoBase64;
    private String role; // "USER" or "ADMIN"
    private LocalDateTime registeredAt;

    public User() {}

    public User(String id, String name, String email, String password, int age, String webcamPhotoBase64, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.age = age;
        this.webcamPhotoBase64 = webcamPhotoBase64;
        this.role = role;
        this.registeredAt = LocalDateTime.now();
    }

    // Getters and Setters omitted for brevity...
}`
  },
  {
    name: 'MediaItem.java',
    path: 'src/main/java/com/movieguard/model/MediaItem.java',
    category: 'Model',
    code: `package com.movieguard.model;

import java.time.LocalDateTime;

public class MediaItem {
    private String id;
    private String title;
    private String description;
    private String category;
    private String posterUrl;
    private String videoUrl;
    private String duration;
    private String rating; // U, U/A, A
    private int minAge;
    private boolean isUserUploaded;
    private long views;
    private LocalDateTime createdAt;

    public MediaItem() { this.createdAt = LocalDateTime.now(); }
}`
  },
  {
    name: 'InMemoryStore.java',
    path: 'src/main/java/com/movieguard/store/InMemoryStore.java',
    category: 'Store',
    code: `package com.movieguard.store;

import com.movieguard.model.MediaItem;
import com.movieguard.model.User;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class InMemoryStore {
    private final Map<String, User> userMap = new ConcurrentHashMap<>();
    private final List<MediaItem> mediaList = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> activityLogs = new CopyOnWriteArrayList<>();

    public InMemoryStore() {
        initDefaultData();
    }

    // Thread-safe in-memory state store logic...
}`
  },
  {
    name: 'LoginController.java',
    path: 'src/main/java/com/movieguard/controller/LoginController.java',
    category: 'Controller',
    code: `package com.movieguard.controller;

import com.movieguard.model.User;
import com.movieguard.store.InMemoryStore;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class LoginController {

    @Autowired
    private InMemoryStore store;

    @PostMapping("/login")
    public String handleLogin(@RequestParam String email, @RequestParam String password, HttpSession session) {
        // Authenticate user & start session
        return "redirect:/home";
    }
}`
  },
  {
    name: 'MovieController.java',
    path: 'src/main/java/com/movieguard/controller/MovieController.java',
    category: 'Controller',
    code: `package com.movieguard.controller;

import com.movieguard.model.MediaItem;
import com.movieguard.model.User;
import com.movieguard.store.InMemoryStore;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class MovieController {

    @Autowired
    private InMemoryStore store;

    @GetMapping("/player/{id}")
    public String playMovie(@PathVariable String id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("currentUser");
        Boolean faceVerified = (Boolean) session.getAttribute("faceVerified_" + id);

        if (user == null) return "redirect:/login";

        Optional<MediaItem> mediaOpt = store.findMediaById(id);
        if (mediaOpt.isEmpty()) return "redirect:/movies";

        MediaItem media = mediaOpt.get();

        // 1. Age Restriction Gate (Applies to all)
        if (user.getAge() < media.getMinAge()) {
            store.logActivity(user.getEmail(), "AGE_BLOCKED", "Underage stream attempt", "DENIED");
            return "redirect:/access-denied?reason=age&movieId=" + id;
        }

        // 2. Biometric Gate: ONLY required for 'A' certified movies (18+)
        // U and U/A certified movies stream directly without facial scan!
        boolean requiresFaceVerify = "A".equalsIgnoreCase(media.getRating()) || media.getMinAge() >= 18;
        if (requiresFaceVerify && (faceVerified == null || !faceVerified)) {
            return "redirect:/verifyface?movieId=" + id;
        }

        media.setViews(media.getViews() + 1);
        model.addAttribute("user", user);
        model.addAttribute("movie", media);
        return "player";
    }
}`
  },
  {
    name: 'FaceVerificationController.java',
    path: 'src/main/java/com/movieguard/controller/FaceVerificationController.java',
    category: 'Controller',
    code: `package com.movieguard.controller;

import com.movieguard.store.InMemoryStore;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class FaceVerificationController {

    @Autowired
    private InMemoryStore store;

    @PostMapping("/api/verify-face")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> processFaceScan(@RequestBody Map<String, String> requestData, HttpSession session) {
        // Facial biometric matching algorithm & session token issuance
        return ResponseEntity.ok(Map.of("verified", true, "score", 96));
    }
}`
  },
  {
    name: 'pom.xml',
    path: 'pom.xml',
    category: 'Config',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.movieguard</groupId>
    <artifactId>movie-guard</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
    </dependencies>
</project>`
  }
];

interface JavaCodeInspectorProps {
  onClose: () => void;
}

export const JavaCodeInspector: React.FC<JavaCodeInspectorProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<JavaFile>(JAVA_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                Java 17 / Spring Boot Source Inspector
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Project Maven Workspace • Maven pom.xml & Spring Controllers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy File'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File Sidebar */}
          <div className="w-64 bg-zinc-900/50 border-r border-zinc-800 p-3 overflow-y-auto flex flex-col gap-1 text-xs">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
              <FolderTree className="w-3.5 h-3.5" />
              Source Package Tree
            </div>

            {JAVA_PROJECT_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`p-2.5 rounded-xl text-left font-mono flex flex-col gap-0.5 transition-all ${
                  selectedFile.path === file.path
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs line-clamp-1">{file.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                    {file.category}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 line-clamp-1">{file.path}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 bg-zinc-950 p-4 overflow-auto flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 text-zinc-400 text-[11px]">
              <span className="text-amber-400 font-semibold">{selectedFile.path}</span>
              <span className="text-zinc-500">UTF-8 • Java 17</span>
            </div>

            <pre className="text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 flex-1 overflow-auto select-text">
              <code>{selectedFile.code}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
