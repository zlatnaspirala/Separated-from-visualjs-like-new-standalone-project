import {mobileAdaptation} from "../../mobile.js";
import {byId, isMobile, jsonHeaders, notify, REDLOG} from "../utility.js";
import {ROCK_RANK} from "./player-skills.js";

export class RCSAccount {

	apiDomain = "https://maximumroulette.com";

	email = null;
	token = null;

	constructor() {
		this.visitor()

		addEventListener('F12', (e) => {
			console.log(`%c[Debbuger] ${e.detail}`, REDLOG)
			localStorage.removeItem("visitor");
			this.visitor(e.detail)
		})
		mobileAdaptation.testExperimental.catchHacker();

		this.leaderboardBtn = document.getElementById('leaderboardBtn');
		this.leaderboardBtn.addEventListener("click", this.getLeaderboard)
	}

	createDOM = () => {
		var parent = document.createElement('div');
		this.parent = parent;

		parent.style = `
		  position: absolute;
			border-radius: 4px;
			top: 20%;
			left: 35%;
			width: 30%;
			padding: 10px 10px 10px 10px;
			box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
		`;
		if(isMobile) {
			parent.style = `
		position: absolute;
		border-radius: 4px;
    top: 20%;
    left: 0%;
  
    padding: 10px;`;
		}

		parent.id = 'myAccountLoginForm';

		var logo = document.createElement('img');
		logo.id = 'logologin';
		logo.style = 'width: max-content;'
		logo.src = './assets/icons/icon96.png';

		var title = document.createElement('div');
		title.style.display = 'flex';
		title.innerHTML = `
		<h2 style='margin: 5px 5px;'>Rocket GamePlay Login Form</h2>
		`;
		title.appendChild(logo)

		var content = document.createElement('div');
		content.style.display = 'flex';
		content.style.flexDirection = 'column';
		content.style.background = 'transparent';

		var emailLabel = document.createElement('span');
		emailLabel.id = 'emailLabel';
		emailLabel.innerHTML = `Email:`;
		var email = document.createElement('input');
		email.id = 'arg-email';
		var passLabel = document.createElement('span');
		passLabel.id = 'passLabel';
		passLabel.innerHTML = `Passw:`;
		var pass = document.createElement('input');
		pass.id = 'arg-pass';

		var loginBtn = document.createElement('button');
		loginBtn.id = 'loginRCSBtn'
		loginBtn.innerHTML = `LOGIN`;
		loginBtn.classList.add('btn')
		loginBtn.addEventListener('click', this.login)

		var gotoRegisterMyAccount = document.createElement('button');
		gotoRegisterMyAccount.id = 'registerBtn';
		gotoRegisterMyAccount.classList = `btn`;
		gotoRegisterMyAccount.innerHTML = `REGISTER`;
		gotoRegisterMyAccount.addEventListener('click', this.register)

		var hideLoginMyAccount = document.createElement('button');
		hideLoginMyAccount.classList = `btn`;
		hideLoginMyAccount.innerHTML = `NO LOGIN -> FREE PLAY`;
		hideLoginMyAccount.addEventListener('click', () => {
			byId('myAccountLoginForm').remove();
		})

		var descText = document.createElement('span');
		descText.id = 'descText';
		// logo.style = 'width: max-content;'
		descText.innerHTML = `<span>Hang3d use webcam for video chat and streaming data</span>
		<span>Add Url params '?video=false&audio=false' to disable streaming</span>
		`;

		parent.appendChild(title)
		parent.appendChild(content)
		content.appendChild(emailLabel)
		content.appendChild(email)
		content.appendChild(passLabel)
		content.appendChild(pass)
		content.appendChild(loginBtn)
		content.appendChild(gotoRegisterMyAccount)
		content.appendChild(hideLoginMyAccount)
		// content.appendChild(logo)
		content.appendChild(descText)
		document.body.appendChild(parent)
	}

	createLeaderboardDOM = (data) => {
		if (byId('leaderboard') != null) {
			byId('leaderboard').style.display = 'block';
			return;
		}
		console.log('TEST MOBILE +++')
		var parent = document.createElement('div');
		parent.style = `
			position: absolute;
			border-radius: 4px;
			top: 10%;
			left: 15%;
			width: 60%;
			padding: 10px 10px 10px 10px;
			box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
		`;
		if(isMobile) {
			console.log('TEST MOBILE ')
			parent.style = `
			position: absolute;
			border-radius: 4px;
			top: 10%;
			left: 0%;
			width: 95%;
			padding: 10px;`;
		}
		parent.id = 'leaderboard';

		var title = document.createElement('div');
		title.innerHTML = `<h3>Top 10 leaderboard [RocketCraftingServer]</h3>`;
		parent.appendChild(title)

		var tableLabel = document.createElement('div');
		tableLabel.style.display = 'flex';
		tableLabel.style.flexDirection = 'row';
		var nicklabel = document.createElement('div');
		nicklabel.innerText = 'Nickname';
		nicklabel.style.width = '100%';
			var pointslabel = document.createElement('div');
			pointslabel.innerText = 'Points';
			pointslabel.style.width = '100%';
			tableLabel.appendChild(nicklabel)
			tableLabel.appendChild(pointslabel)

			parent.appendChild(tableLabel)

		data.forEach(element => {
			var table = document.createElement('div');
			table.style.display = 'flex';
			table.style.flexDirection = 'row';
			table.style.justifyContent = 'center';
			table.style.alignItems = 'center';
			
			var nick = document.createElement('div');
			nick.innerText = element.nickname;
			nick.style.width = '100%';
			var points = document.createElement('div');
			points.innerText = element.points;
			points.style.width = '100%';
			// var medal = document.createElement('img');
			// medal.id = 'medal';
			// logo.src = './assets/icons/icon96.png';
			table.appendChild(nick)
			table.appendChild(points)
			table.innerHTML += (ROCK_RANK.getRankMedalImg(ROCK_RANK.getRank(element.points)))
			parent.appendChild(table)
		});

		var hideBtn = document.createElement('button');
		hideBtn.classList = 'btn';
		hideBtn.innerText = 'HIDE';
		hideBtn.addEventListener('click', () => {
			parent.style.display = 'none';
		})
		parent.appendChild(hideBtn)

		document.body.appendChild(parent)
	}

	register = () => {
		this.register_procedure(this)
	}

	async register_procedure() {
		let route = this.apiDomain || location.origin;
		byId('loginRCSBtn').disabled = true;
		byId('registerBtn').disabled = true;
		let args = {
			emailField: (byId('arg-email') != null ? byId('arg-email').value : null),
			passwordField: (byId('arg-pass') != null ? byId('arg-pass').value : null)
		}
		if(args.emailField == null || args.passwordField == null) {
			notify.show('Please fill up email and passw for login or register.')
		}
		fetch(route + '/rocket/register', {
			method: 'POST',
			headers: jsonHeaders,
			body: JSON.stringify(args)
		}).then((d) => {
			return d.json();
		}).then((r) => {
			notify.error(`${r.message}`)
			if(r.message == "Check email for conmfirmation key.") {
				this.email = byId('arg-email').value;
				sessionStorage.setItem('email', byId('arg-email').value)
				byId('emailLabel').remove();
				byId('loginRCSBtn').remove();
				byId('arg-email').remove();
				byId("passLabel").innerHTML = 'ENTER CONFIRMATION CODE';
				byId('arg-pass').value = "";
				byId('registerBtn').removeEventListener('click', this.register)
				byId('registerBtn').disabled = false;
				byId('registerBtn').innerHTML = 'CONFIRM CODE FROM EMAIL';
				byId('registerBtn').id = 'CC';
				byId('CC').addEventListener('click', () => {
					this.confirmation()
				})
				sessionStorage.setItem('RocketAcountRegister', 'Check email for conmfirmation key.')
			} else {
				setTimeout(() => {
					notify.show("Next Register/Login call try in 5 secounds...")
					this.preventDBLOG = false;
					this.preventDBREG = false;
					byId('loginRCSBtn').disabled = false;
					byId('registerBtn').disabled = false;
				}, 5000)
			}
		}).catch((err) => {
			console.log('[My Account Error]', err)
			notify.show("Next Register call try in 5 secounds...")
			setTimeout(() => {
				this.preventDBLOG = false;
				this.preventDBREG = false;
				byId('loginRCSBtn').disabled = false;
				byId('registerBtn').disabled = false;
			}, 5000)
			return;
		})
	}

	async confirmation() {
		let route = this.apiDomain;
		const args = {
			emailField: this.email,
			tokenField: byId('arg-pass').value,
		}
		fetch(route + '/rocket/confirmation', {
			method: 'POST',
			headers: jsonHeaders,
			body: JSON.stringify(args)
		}).then((d) => {
			return d.json();
		}).then((r) => {
			if(r.message == "Wrong confirmation code.") {
			} else if(r.message == "Confirmation done.") {
				alert(r.message)
				this.parent.innerHTML = '';
				// ----
				this.createDOM();
			}
			notify.error(`${r.message}`)
		})

	}

	async login() {
		let route = this.apiDomain || location.origin;
		byId('loginRCSBtn').disabled = true;
		byId('registerBtn').disabled = true;
		let args = {
			emailField: (byId('arg-email') != null ? byId('arg-email').value : null),
			passwordField: (byId('arg-pass') != null ? byId('arg-pass').value : null)
		}
		fetch(route + '/rocket/login', {
			method: 'POST',
			headers: jsonHeaders,
			body: JSON.stringify(args)
		}).then((d) => {
			return d.json();
		}).then((r) => {
			console.log(r.message);
			notify.show(`${r.message}`)
			if(r.message == "User logged") {
				this.email = byId('arg-email').value;
				byId('myAccountLoginForm').style.display = 'none';
				sessionStorage.setItem('RocketAcount', JSON.stringify(r.flag))
			}
		}).catch((err) => {
			console.log('[My Account Error]', err)
			notify.show("Next Login call try in 5 secounds...")
			setTimeout(() => {
				this.preventDBLOG = false;
				this.preventDBREG = false;
				byId('registerBtn').disabled = false;
				byId('loginRCSBtn').disabled = false;
			}, 5000)
			return;
		})
	}

	async visitor(isRegular) {
		if(typeof isRegular === 'undefined') isRegular = 'Yes';
		if(localStorage.getItem("visitor") == 'welcome') return;
		let route = this.apiDomain;
		let args = {
			email: (byId('arg-email') != null ? byId('arg-email').value : 'no-email'),
			userAgent: navigator.userAgent.toString(),
			fromUrl: location.href.toString(),
			isRegular: isRegular
		}
		fetch(route + '/rocket/visitors', {
			method: 'POST',
			headers: jsonHeaders,
			body: JSON.stringify(args)
		}).then((d) => {
			return d.json();
		}).then(() => {
			localStorage.setItem("visitor", "welcome")
		}).catch((err) => {console.log('ERR', err)})
	}

	getLeaderboard = async (e) => {
		e.preventDefault();
		this.leaderboardBtn.disabled = true;
		fetch(this.apiDomain + '/rocket/public-leaderboard', {
			method: 'POST',
			headers: jsonHeaders,
			body: JSON.stringify({})
		}).then((d) => {
			return d.json();
		}).then((r) => {
			notify.error(`${r.message}`)
			if(r.message == "You got leaderboard data.") {
				this.leaderboardData = r.leaderboard;
				this.createLeaderboardDOM(r.leaderboard);
			}
			setTimeout(() => {this.leaderboardBtn.disabled = false}, 5000)
		}).catch((err) => {
			console.log('[Leaderboard Error]', err)
			notify.show("Next call try in 5 secounds...")
			setTimeout(() => {this.leaderboardBtn.disabled = false}, 5000)
			return;
		})
	}

}