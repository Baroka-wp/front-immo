window.chatFlow = {
    start: {
        message: "Voulez-vous prendre un rendez-vous ?",
        options: [
            { text: "OUI", next: "yesResponse" },
            { text: "Non", next: "noResponse" }
        ]
    },
    yesResponse: {
        message: "Quel date vous conviens ?",
        type: "input",
        label: "Entrez une date:",
        next: "collectName"
    },
    noResponse: {
        message: "Vous avez des questions sur ce bien ?",
        next: "collectQuestion"
    },
    collectName: {
        message: "Merci nous avons bien pris note. Quel est votre nom ?",
        type: "input",
        label: "Entrez votre nom",
        next: "collectCity"
    },
    collectCity: {
        message: "Quel est votre ville ?",
        type: "input",
        label: "Entrez votre ville",
        next: "collectPhone"
    },

    collectPhone: {
        message: "Quel est votre numero de telephone ?",
        type: "input",
        label: "Entrez votre contact:",
        next: "collectInvesOrMain"
    },
    
    collectQuestion: {
        message: "Veuillez poser votre question.",
        type: "input",
        label: "Entrez votre question:",
        next: "collectImage"
    },
    answerQuestion: {
        message: "Merci pour votre question, nous y répondrons bientôt.",
        next: "collectImage"
    },
    collectInvesOrMain: {
        message: "Voulez vous en faire une residence principale ou est-ce un investissement ?",
        type: "radiobox",
        options: [
            { text: "Residence principale", next: "end" },
            { text: "Investissement", next: "end" }
        ]
    },
    collectImage: {
        message: "Voici une image du bien immobilier.",
        type: "image",
        src: "./assets/image2.jpg",
        next: "end"
    },
    end: {
        message: "Merci pour votre temps. Si vous avez des questions, n'hésitez pas à les poser.",
        options: []
    }
};
