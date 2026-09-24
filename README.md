# Movie Guard – Secure Media Library (Java Spring Boot Web Application)

Movie Guard is a personal media library web application featuring user registration, facial biometric verification using webcam input, role-based access control (Admin / User), age-restriction policy enforcement, custom HTML5 video player with watermark protection, and in-memory audit logs.

---

## Technical Stack

* **Java Version:** Java 17
* **Framework:** Spring Boot 3.2.3
* **Template Engine:** Thymeleaf / HTML5
* **Styling:** CSS3 / Bootstrap 5 / Tailwind CSS
* **Build Tool:** Apache Maven 3.8+
* **Storage:** Thread-safe In-Memory Store (`InMemoryStore.java`)

---

## Project Structure

```
movie-guard/
├── pom.xml
├── README.md
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── movieguard/
│       │           ├── MovieGuardApplication.java
│       │           ├── controller/
│       │           │   ├── LoginController.java
│       │           │   ├── RegisterController.java
│       │           │   ├── MovieController.java
│       │           │   ├── ProfileController.java
│       │           │   ├── FaceVerificationController.java
│       │           │   └── AdminController.java
│       │           ├── model/
│       │           │   ├── User.java
│       │           │   └── MediaItem.java
│       │           └── store/
│       │               └── InMemoryStore.java
│       └── resources/
│           ├── application.properties
│           └── templates/
│               ├── login.html
│               ├── register.html
│               ├── home.html
│               ├── movies.html
│               ├── movie-details.html
│               ├── player.html
│               ├── profile.html
│               ├── verifyface.html
│               ├── access-denied.html
│               └── admin.html
```

---

## How to Run in IntelliJ IDEA

1. **Open Project:**
   * Open IntelliJ IDEA.
   * Click **File -> Open...** and select the root directory of this project (`movie-guard` containing `pom.xml`).

2. **Verify JDK Configuration:**
   * Go to **File -> Project Structure -> Project**.
   * Ensure SDK is set to **Java 17** or higher.

3. **Maven Reload:**
   * Open the **Maven** sidebar tool window on the right.
   * Click the **Reload All Maven Projects** (circular arrow) button to resolve all dependencies.

4. **Launch Application:**
   * Navigate to `src/main/java/com/movieguard/MovieGuardApplication.java`.
   * Right-click the file or `main` method and click **Run 'MovieGuardApplication'**.
   * Open your browser and navigate to `http://localhost:8080`.

---

## How to Run in Eclipse IDE

1. **Import Project:**
   * Open Eclipse IDE.
   * Select **File -> Import... -> Maven -> Existing Maven Projects**.
   * Browse to the project folder containing `pom.xml` and click **Finish**.

2. **Configure JDK:**
   * Right-click project -> **Properties -> Java Build Path -> Libraries**.
   * Ensure **JRE System Library [JavaSE-17]** or higher is selected.

3. **Run Application:**
   * Right-click `MovieGuardApplication.java` -> **Run As -> Java Application** (or **Spring Boot App** if Spring Tools 4 is installed).
   * Open browser at `http://localhost:8080`.

---

## How to Run in Replit (Online IDE)

1. Create a new **Java / Spring Boot** Repl or import from GitHub.
2. Ensure Java 17 is selected in `.replit` config.
3. Run the Maven package command in the shell:
   ```bash
   mvn spring-boot:run
   ```
4. Access the embedded web preview on port `8080`.

---

## Default Demo Credentials

* **Admin Account:**
  * **Email:** `admin@movieguard.sec`
  * **Password:** `admin123`
* **Regular User Account:**
  * **Email:** `alex@example.com`
  * **Password:** `secure123`
* **Minor User (Age 15):**
  * **Email:** `minor@example.com`
  * **Password:** `user123`
