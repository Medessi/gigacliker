let points = 0;
        let gigaInternet = 0;
        let shareCount = 0;
        let username = '';
        let isRegistered = false;
        const counterElement = document.getElementById('counter');
        const gigaCounterElement = document.getElementById('gigaCounter');
        const clickerButton = document.getElementById('clickerButton');
        const convertButton = document.getElementById('convertButton');
        const loginScreen = document.getElementById('loginScreen');
        const gameScreen = document.getElementById('gameScreen');
        const loginForm = document.getElementById('loginForm');
        const whatsappShareButton = document.getElementById('whatsappShare');
        const facebookShareButton = document.getElementById('facebookShare');
        const leaderboardList = document.getElementById('leaderboardList');

        const users = [
            { name: "Alice", points: 1500, gigaInternet: 20 },
            { name: "Bob", points: 2000, gigaInternet: 15 },
            { name: "Charlie", points: 1800, gigaInternet: 25 },
            { name: "Diana", points: 2200, gigaInternet: 30 },
            { name: "Evan", points: 1600, gigaInternet: 18 }
        ];

        function login(username) {
            isRegistered = true;
            localStorage.setItem('currentUser', username);
            loginScreen.style.display = 'none';
            gameScreen.style.display = 'flex';
            loadUserData();
            showTutorial();
        }

        function simulateOtherPlayers() {
    users.forEach(user => {
        if (user.name !== username) {
            // Simuler des gains de points avec des probabilités différentes pour chaque utilisateur
            if (Math.random() < getPlayerActivityLevel(user)) {
                const pointsGained = Math.floor(Math.random() * 15) + 1; // Gain variable
                user.points += pointsGained;
            }

            // Simuler des conversions occasionnelles de points en Giga Internet
            if (Math.random() < 0.05 && user.points >= 200) { // Conversion plus rare et seuil plus élevé
                const pointsToConvert = Math.floor(Math.random() * (user.points - 99)) + 100;
                const gigaToAdd = Math.floor(pointsToConvert / 100);
                user.points -= pointsToConvert;
                user.gigaInternet += gigaToAdd;
            }
        }
    });
    updateLeaderboard();
}

// Fonction pour déterminer le niveau d'activité d'un joueur (de 0.3 à 0.8)
function getPlayerActivityLevel(user) {
    // Les joueurs plus expérimentés ont une activité plus élevée
    if (user.experienceLevel > 5) {
        return 0.8;
    } else if (user.experienceLevel > 2) {
        return 0.6;
    }
    return 0.3; // Pour les débutants
}

// Simuler des retraits ou des conversions moins fréquemment
function simulateWithdrawals() {
    users.forEach(user => {
        if (user.name !== username && Math.random() < 0.2 && user.points >= 150) { // Moins fréquent et seuil plus élevé
            const pointsToConvert = Math.floor(Math.random() * (user.points - 99)) + 100;
            const gigaToAdd = Math.floor(pointsToConvert / 100);
            user.points -= pointsToConvert;
            user.gigaInternet += gigaToAdd;
        }
    });
}

// Exécuter la simulation des autres joueurs toutes les 5 à 10 secondes
setInterval(simulateOtherPlayers, Math.floor(Math.random() * 5000) + 5000);

// Exécuter la simulation des retraits toutes les 10 à 20 secondes
setInterval(simulateWithdrawals, Math.floor(Math.random() * 10000) + 10000);

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            username = document.getElementById('username').value;
            const phone = document.getElementById('phone').value;
            const operator = document.getElementById('operator').value;
            const password = document.getElementById('password').value;

            if (!localStorage.getItem(username)) {
                localStorage.setItem(username, JSON.stringify({
                    phone: phone,
                    operator: operator,
                    password: password,
                    points: 0,
                    gigaInternet: 0,
                    shareCount: 0
                }));
                showPopup('alertPopup', 'Inscription réussie', 'Bienvenue sur GigaClicker Pro !');
            } else {
                const userData = JSON.parse(localStorage.getItem(username));
                if (userData.password !== password) {
                    showPopup('alertPopup', 'Erreur', 'Mot de passe incorrect !');
                    return;
                }
            }

            login(username);
        });

        function loadUserData() {
            const userData = JSON.parse(localStorage.getItem(username));
            points = userData.points || 0;
            gigaInternet = userData.gigaInternet || 0;
            shareCount = userData.shareCount || 0;
            updateCounters();
        }

        function updateCounters() {
            counterElement.textContent = `${points} points`;
            gigaCounterElement.textContent = `${gigaInternet} Giga Internet`;
            const userData = JSON.parse(localStorage.getItem(username));
            userData.points = points;
            userData.gigaInternet = gigaInternet;
            userData.shareCount = shareCount;
            localStorage.setItem(username, JSON.stringify(userData));
            updateLeaderboard();
        }

        clickerButton.addEventListener('click', () => {
            points++;
            updateCounters();
            createParticle();
            if (points === 100) {
                showAchievement("Vous avez atteint 100 points !");
            } else if (points === 1000) {
                showAchievement("Wow ! 1000 points !");
            }
        });

        convertButton.addEventListener('click', () => {
    if (points >= 100) {
        if (shareCount < 5) {
            const remainingShares = 5 - shareCount;
            showPopup('alertPopup', 'Partage requis', `Vous devez partager avec 5 amis sur WhatsApp avant de pouvoir convertir. Partages restants : ${remainingShares}`);
        } else {
            convertPointsToGiga();
        }
    } else {
        showPopup('alertPopup', 'Points insuffisants', 'Vous avez besoin d\'au moins 100 points pour convertir en Giga Internet !');
    }
});

whatsappShareButton.addEventListener('click', () => {
    shareOnWhatsApp();
});

// Fonction pour rediriger vers le site partenaire avec un callback
function redirectToPartnerSite(pointsToConvert) {
    const userID = username; // Identifier l'utilisateur actuel
    const callbackUrl = encodeURIComponent(`https://gigaclicker.app/callback?points=${pointsToConvert}&user=${userID}`);
    const partnerUrl = `https://gigaconnex.onrender.com?points=${pointsToConvert}&user=${userID}&callback=${callbackUrl}`;
    
    window.location.href = partnerUrl; // Rediriger vers le site partenaire
}

// Fonction principale pour convertir les points en Giga, avec redirection
function convertPointsToGiga() {
    const gigaToAdd = Math.floor(points / 100); // Calculer combien de Gigas peuvent être ajoutés
    
    if (gigaToAdd > 0) {
        // Au lieu d'ajouter directement les Gigas, rediriger vers le site partenaire
        const pointsToConvert = gigaToAdd * 100; // Points utilisés pour la conversion
        redirectToPartnerSite(pointsToConvert);  // Rediriger l'utilisateur avant d'ajouter les Gigas
    } else {
        showPopup('alertPopup', 'Points insuffisants', 'Vous avez besoin d\'au moins 100 points pour convertir en Giga Internet.');
    }
}

// Fonction pour gérer le retour du site partenaire et ajouter les Giga après validation
function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const userID = urlParams.get('user');
    const pointsToConvert = parseInt(urlParams.get('points'));
    const success = urlParams.get('success'); // Cette valeur est transmise par le site partenaire

    if (success === 'true') {
        const gigaToAdd = Math.floor(pointsToConvert / 100); // Calculer le nombre de Giga à ajouter
        const user = users.find(u => u.name === userID); // Trouver l'utilisateur correspondant

        if (user) {
            user.points -= pointsToConvert; // Réduire les points
            user.gigaInternet += gigaToAdd; // Ajouter les Giga Internet
            showPopup('alertPopup', 'Félicitations', `Vous avez reçu ${gigaToAdd} Giga Internet après avoir terminé l'action.`);
            updateCounters(); // Mettre à jour les compteurs
        }
    } else {
        showPopup('alertPopup', 'Action non complétée', 'Vous devez terminer l\'action sur le site partenaire pour recevoir vos Giga Internet.');
    }
}

// Appeler la fonction de callback lors du chargement de la page callback
if (window.location.pathname === '') { // Assurez-vous que l'URL est correcte
    handleCallback();
}
function shareOnWhatsApp() {
    const message = encodeURIComponent(`Je joue à GigaClicker ! J'ai déjà ${points} points et ${gigaInternet} Giga Internet. Rejoins-moi sur https://gigaclicker.ap !`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    shareCount++;
    updateCounters();
}

        facebookShareButton.addEventListener('click', () => {
            const url = encodeURIComponent("https://bit.ly/3U40rv7");
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        });

        function createParticle() {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            
            const startX = clickerButton.offsetLeft + clickerButton.offsetWidth / 2;
            const startY = clickerButton.offsetTop + clickerButton.offsetHeight / 2;
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            document.body.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 4;
            const lifetime = 1000 + Math.random() * 1000;
            
            let opacity = 1;
            
            function animateParticle() {
                const currentLeft = parseFloat(particle.style.left);
                const currentTop = parseFloat(particle.style.top);
                
                particle.style.left = `${currentLeft + Math.cos(angle) * velocity}px`;
                particle.style.top = `${currentTop + Math.sin(angle) * velocity}px`;
                
                opacity -= 1 / (lifetime / 16);
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            }
            
            requestAnimationFrame(animateParticle);
        }

        function updateLeaderboard() {
            simulateWithdrawals();
            
            const leaderboardData = [
                { name: username, points: points, gigaInternet: gigaInternet },
                ...users
            ];
            
            leaderboardData.sort((a, b) => b.points - a.points);
            
            leaderboardList.innerHTML = '';
            leaderboardData.forEach((player, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${index + 1}. ${player.name}</span>
                    <span>${player.points} points | ${player.gigaInternet} Giga</span>
                `;
                leaderboardList.appendChild(li);
            });
        }

        Particles.init({
            selector: '#particles',
            color: ['#ff00ff', '#00ffff', '#ffffff'],
            connectParticles: true,
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        maxParticles: 100
                    }
                },
                {
                    breakpoint: 425,
                    options: {
                        maxParticles: 60
                    }
                }
            ]
        });

        function checkRegistration() {
            const storedUsername = localStorage.getItem('currentUser');
            if (storedUsername) {
                username = storedUsername;
                login(username);
            }
        }

        function showTutorial() {
            document.getElementById('tutorialPopup').style.display = 'block';
        }

        document.getElementById('closeTutorial').addEventListener('click', () => {
            document.getElementById('tutorialPopup').style.display = 'none';
        });

        function showPopup(id, title, message) {
            document.getElementById(id).style.display = 'block';
            if (id === 'alertPopup') {
                document.getElementById('alertTitle').textContent = title;
                document.getElementById('alertMessage').textContent = message;
            } else if (id === 'achievementPopup') {
                document.getElementById('achievementMessage').textContent = message;
            }
        }

        function closePopup(id) {
            document.getElementById(id).style.display = 'none';
        }

        function showAchievement(message) {
            showPopup('achievementPopup', '', message);
        }

        const tips = [
            "Cliquez rapidement pour gagner plus de points !",
            "N'oubliez pas de partager avec vos amis pour débloquer la conversion !",
            "Convertissez vos points en Giga Internet pour grimper dans le classement !",
            "Restez attentif aux offres spéciales et aux bonus !"
        ];

        function showRandomTip() {
            const tipContainer = document.getElementById('tipContainer');
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            tipContainer.textContent = "Astuce : " + randomTip;
            tipContainer.style.display = 'block';
            setTimeout(() => {
                tipContainer.style.display = 'none';
            }, 5000);
        }

        setInterval(showRandomTip, 30000); // Show a tip every 30 seconds

        window.addEventListener('load', checkRegistration);