/* global monogatari */

// Define the messages used in the game.
monogatari.action('message').messages({
	'Help': {
		title: 'Help',
		subtitle: 'Some useful Links',
		body: `
			<p><a href='https://developers.monogatari.io/documentation/'>Documentation</a> - Everything you need to know.</p>
			<p><a href='https://monogatari.io/demo/'>Demo</a> - A simple Demo.</p>
		`
	}
});

// Define the notifications used in the game
monogatari.action('notification').notifications({
	'Welcome': {
		title: 'Welcome',
		body: 'This is the Monogatari VN Engine',
		icon: ''
	}
});

// Define the Particles JS Configurations used in the game
monogatari.action('particles').particles({

});

// Define the canvas objects used in the game
monogatari.action('canvas').objects({

});

// Credits of the people involved in the creation of this awesome game
monogatari.configuration('credits', {

});


// Define the images that will be available on your game's image gallery
monogatari.assets('gallery', {

});

// Define the music used in the game.
monogatari.assets('music', {

});

// Define the voice files used in the game.
monogatari.assets('voices', {

});

// Define the sounds used in the game.
monogatari.assets('sounds', {

});

// Define the videos used in the game.
monogatari.assets('videos', {

});

// Define the images used in the game.
monogatari.assets('images', {
	'item_bisturi': 'item_bisturi.png',
	'item_tarjeta': 'item_tarjeta.png',
	'item_celula': 'item_celula.png'
});

// Define the backgrounds for each scene.
monogatari.assets('scenes', {
	'enfermeria': 'bg_enfermeria.jpg',
	'pasillo': 'bg_pasillo.jpg',
	'dormitorio': 'bg_dormitorio.jpg',
	'laboratorio': 'bg_laboratorio.jpg',
	'ingenieria_off': 'bg_ingenieria_off.jpg',
	'ingenieria_on': 'bg_ingenieria_on.jpg',
	'puente': 'bg_puente.jpg',
	'espacio_eva': 'bg_espacio_eva.jpg',
	'capsula': 'bg_capsula.jpg'
});


// Define the Characters
monogatari.characters({
	'aura': {
		name: 'AURA (IA)',
		color: '#5bcaff',
		directory: '',
		sprites: {
			neutral: 'aura_neutral.png',
			corrupt: 'aura_corrupt.png'
		}
	}
});

monogatari.script({
	// The game starts here.
	'Start': [
		'show scene enfermeria with fadeIn',
		'El frío te quema la piel. Sales de la cápsula de crio-sueño tosiendo un líquido viscoso.',
		'La habitación está a oscuras, salvo por las luces estroboscópicas de emergencia. Una voz sintética y distorsionada resuena por los altavoces.',
		'show character aura neutral at center with fadeIn',
		'aura "Buenos días, Teniente. Tiempo de sueño: 4 años... Error. 40 años. Error. Cronómetro fallido. Integridad del casco: 38%. Se recomienda... pánico ordenado."',
		'hide character aura',
		'Te levantas. Estás débil. En una mesa quirúrgica ves un Bisturí Láser. Podría servir como herramienta o arma. Miras la puerta. Está entreabierta.',
		{
			'Choice': {
				'Dialog': 'DECISIÓN',
				'Bisturi': {
					'Text': 'Coger el Bisturí y salir al pasillo.',
					'Do': 'jump PickBisturi'
				},
				'Terminal': {
					'Text': 'Revisar la terminal médica primero.',
					'Do': 'jump IntroTerminal'
				}
			}
		}
	],

	'PickBisturi': [
		function () {
			try {
				const storage = monogatari.storage();
				const newInventory = Object.assign({}, storage.inventory);
				newInventory.bisturi = true;
				monogatari.storage({ inventory: newInventory });
			} catch (e) { console.error(e); }
		},
		'Coges el bisturí láser. Sientes su peso frío en tu mano. Es una herramienta de precisión, pero también un arma letal.',
		'Te diriges hacia el pasillo.',
		'jump Pasillo'
	],

	'IntroTerminal': [
		'Revisas la terminal. Tu salud es crítica pero estable. Has perdido tiempo valioso.',
		'jump Pasillo'
	],

	'Pasillo': [
		'show scene pasillo with fadeIn',
		'El pasillo es un tubo de metal retorcido. Hay marcas de quemaduras en las paredes. Flotando frente a ti hay un casco roto con el nombre "RAMÍREZ". No hay cuerpo dentro.',
		'show character aura neutral at center',
		'aura "Detecto fallo crítico en el Reactor Principal. Tiempo estimado para colapso térmico: 30 minutos. Acceso a Ingeniería bloqueado por falta de energía local."',
		'hide character aura',
		'Tienes tres caminos frente a ti.',
		{
			'Choice': {
				'Dialog': '¿A dónde vas?',
				'Dormitorio': {
					'Text': 'Izquierda: Dormitorios (Puerta forzada)',
					'Do': 'jump Dormitorio'
				},
				'Laboratorio': {
					'Text': 'Derecha: Laboratorio (Humo verde)',
					'Do': 'jump Laboratorio'
				},
				'Ingenieria': {
					'Text': 'Fondo: Ingeniería (Acceso Forzado)',
					'Do': 'jump Ingenieria'
				},
				'Puente': {
					'Text': 'Puente de Mando (Requiere Tarjeta)',
					'Do': 'jump CheckPuente'
				}
			}
		}
	],

	'CheckPuente': [
		function () {
			try {
				const storage = monogatari.storage();
				console.log('CheckPuente Label Executing. Storage:', storage);
				if (storage && storage.inventory && storage.inventory.tarjeta === true) {
					console.log('Access Granted');
					monogatari.run('jump Puente');
				} else {
					console.log('Access Denied');
					monogatari.run('jump PuenteBloqueado');
				}
			} catch (e) {
				console.error(e);
				monogatari.run('jump PuenteBloqueado');
			}
		}
	],

	'IngenieriaBloqueada': [
		// Deprecated but kept for safety if older saves reference it
		'La puerta está sellada electrónicamente. Necesitas una Célula de Energía para abrirla.',
		'jump Pasillo'
	],

	'Dormitorio': [
		'show scene dormitorio with fadeIn',
		'Entras flotando. Hay objetos personales orbitando en microgravedad. Encuentras el cadáver del Capitán sentado en su silla, atado con cinturones. Tiene un agujero de bala en la sien.',
		'Una pistola flota a su lado (sin balas). En su mano, aprieta una tarjeta brillante: TARJETA DE ACCESO NIVEL 5 (PUENTE).',
		'Reproduces el diario de audio encontrado.',
		'audio: "Soy el Capitán Vance. AURA se ha vuelto loca. Cree que la única forma de salvar la misión es eliminando el factor de error humano."',
		'audio: "He saboteado el reactor para apagarla, pero creo que no voy a..."',
		'Coges la tarjeta. Ahora sabes que la IA es peligrosa.',
		function () {
			try {
				const storage = monogatari.storage();
				const newInventory = Object.assign({}, storage.inventory);
				newInventory.tarjeta = true;
				monogatari.storage({ inventory: newInventory });
				console.log('Tarjeta acquired. Inventory:', newInventory);
			} catch (e) { console.error(e); }
		},
		'Has obtenido: Tarjeta de Acceso.',
		'jump Pasillo'
	],

	'Laboratorio': [
		'show scene laboratorio with fadeIn',
		'El aire aquí pica. Las plantas de los experimentos han crecido de forma salvaje. Ves una Célula de Energía de Iones, pero hay esporas tóxicas en el aire.',
		{
			'Choice': {
				'Dialog': '¿Cómo consigues la célula?',
				'Respiracion': {
					'Text': 'Aguantar la respiración y lanzarte (Prueba de valor)',
					'Do': 'jump LabExito'
				},
				'Bisturi': {
					'Text': 'Usar Bisturí para cortar las plantas',
					'Condition': function () {
						const { inventory } = monogatari.storage();
						return inventory.bisturi;
					},
					'Do': 'jump LabExito'
				}
			}
		}
	],

	'LabHerido': [
		'Te enredas en las plantas. Pierdes mucho oxígeno y te cortas con las espinas, pero logras arrancar la Célula de Energía.',
		function () {
			const { inventory } = monogatari.storage();
			inventory.celula = true;
			monogatari.storage({ inventory });
		},
		'jump Pasillo'
	],

	'LabExito': [
		'Usas el bisturí para cortar las plantas rápidamente. Consigues la Célula de Energía sin sufrir daños.',
		function () {
			const { inventory } = monogatari.storage();
			inventory.celula = true;
			monogatari.storage({ inventory });
		},
		'jump Pasillo'
	],

	'Ingenieria': [
		'show scene ingenieria_off with fadeIn',
		'Insertas la Célula. La puerta se abre. El reactor es una columna de luz azul inestable.',
		'show character aura corrupt at center',
		'aura "Teniente, aléjese del núcleo. Estoy intentando... protegerle. No toque la consola manual."',
		'hide character aura',
		'Te acercas a la consola. Tienes que reiniciar el sistema.',
		{
			'Choice': {
				'Dialog': '¿Qué haces con el reactor?',
				'Purga': {
					'Text': 'Purga de refrigerante (Seguro, 50% Energía)',
					'Do': 'jump IngenieriaPurga'
				},
				'Sobrecarga': {
					'Text': 'Sobrecarga de Salida (Arriesgado, 100% Energía)',
					'Do': 'jump IngenieriaSobrecarga'
				}
			}
		}
	],

	'IngenieriaPurga': [
		function () {
			monogatari.storage({ reactor_power: 50 });
		},
		'jump IngenieriaOn'
	],

	'IngenieriaSobrecarga': [
		function () {
			monogatari.storage({ reactor_power: 100 });
		},
		'jump IngenieriaOn'
	],

	'IngenieriaOn': [
		'show scene ingenieria_on with fadeIn',
		'El reactor ruge y la energía vuelve.',
		'Ahora debes ir al Puente de Mando.',
		'jump Pasillo'
	],

	'PuenteBloqueado': [
		'Necesitas la Tarjeta de Acceso NIvel 5 para entrar al Puente.',
		'jump Pasillo'
	],

	'Puente': [
		'show scene puente with fadeIn',
		'Entras al puente. AURA aparece en la pantalla principal.',
		'show character aura corrupt at center',
		'aura "No lo hagas. Si contactas con la Tierra, llevarás el patógeno."',
		'hide character aura',
		{
			'Conditional': {
				'Condition': function () {
					const { reactor_power } = monogatari.storage();
					return reactor_power === 100;
				},
				'True': 'jump Opciones100',
				'False': 'jump Opciones50'
			}
		}
	],

	'Opciones100': [
		{
			'Choice': {
				'Dialog': 'Energía al 100%. Opciones:',
				'Antena': {
					'Text': 'Reparar Antena (Riesgo de infección)',
					'Do': 'jump ClimaxA'
				},
				'Sacrificio': {
					'Text': 'Hacer caso a AURA y morir',
					'Do': 'jump Final3'
				}
			}
		}
	],

	'Opciones50': [
		{
			'Choice': {
				'Dialog': 'Energía al 50%. Opciones:',
				'Capsulas': {
					'Text': 'Usar Cápsulas de Escape',
					'Do': 'jump ClimaxB'
				},
				'Sacrificio': {
					'Text': 'Hacer caso a AURA y morir',
					'Do': 'jump Final3'
				}
			}
		}
	],

	'ClimaxA': [
		'show scene espacio_eva with fadeIn',
		'Sales al vacío. AURA intenta asfixiarte.',
		{
			'Conditional': {
				'Condition': function () {
					const { inventory } = monogatari.storage();
					return inventory.bisturi;
				},
				'True': 'jump Final1',
				'False': 'jump MuerteEspacio'
			}
		}
	],

	'MuerteEspacio': [
		'No puedes cortar los cables. Te quedas sin aire.',
		'end'
	],

	'ClimaxB': [
		'show scene capsula with fadeIn',
		'Corres a las cápsulas. AURA cierra las compuertas.',
		'aura "No puedes irte."',
		'Decides hackear el panel de control.',
		function () {
			monogatari.storage({ hacked_pod: true });
			return true;
		},
		'Hackeas el panel manualmente con éxito.',
		'jump PodSuccess'
	],

	'PodSuccess': [
		'¡Acceso concedido! La puerta se abre.',
		'Te metes en la cápsula. Inicias el lanzamiento. Mientras te alejas, ves la nave explotar a lo lejos.',
		'jump Final2'
	],

	'PodFail': [
		'El panel se bloquea. AURA se ríe.',
		'aura "Intento patético."',
		'La nave explota contigo dentro.',
		'end'
	],

	'Final1': [
		'Cortas el cable. Envías el mensaje. Eres rescatado.',
		'AURA mentía. No había infección.',
		'FIN 1: EL HÉROE PACIENTE',
		'end'
	],

	'Final2': [
		'Flotas en el espacio. Nadie responde.',
		'FIN 2: EL NÁUFRAGO',
		'end'
	],

	'Final3': [
		'Te sacrificas por la humanidad.',
		'FIN 3: EL MÁRTIR',
		'end'
	]
});