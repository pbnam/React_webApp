#Setup Jenkins

1. Install SonarQube Scanner Plugin
    - Click on “Manage Jenkins” > “Manage Plugins” > Click on the “Available tab” then search for SonarQube
    - Install SonarQube Scanner
2. Generate Token in SonarQube Server
    - Log in as Administrator to SonarQube
    - Click Admin account Icon -> "My Account"
    - Click on the “Security” tab
    - A new “Tokens” area will appear. Under “Generate Tokens“, put a name you like then hit “Generate“
3. Configure SonarQube in Jenkins
    - Go to “Manage Jenkins” > “Configure System“
    - Scroll down to the SonarQube configuration section, click Add SonarQube, and add the values you will be prompted to provide.
    - Put Name (SonarQubeScanner), SonarQube server URL, that is where your SonarQube server is running at then the “Server authentication token“. For the Server authentication token, click on “Add” then “Jenkins”
    - Kind : choose “Secret Text”
    - ID : SonarQubeToken
    - Put secret from step 2 -> Save
4. Configure SonarQube Scanner
    - Manage Jenkins” then click on “Global configuration Tool“
    - SonarQube Scanner“. Click on “Add SonarQube Scanner” : configure Sonarqube environment
5. Create a Project in SonarQube
    - Log in as Administrator to SonarQube
    - Click on “Administration” > “Projects“. Click on the “Projects” drop down list and click on “Management“. On right conner -> “Create Project“.
6. SonarQube webhook
   ...................
