const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");
const status = document.getElementById("status");
const ultima = document.getElementById("ultima");
const sinal = document.getElementById("sinal");
const atualizar = document.getElementById("atualizar");
const nomeLocal = document.getElementById("nome-local");

const papel = document.getElementById("papel");
const lixeira = document.getElementById("lixeira");
const mensagem = document.getElementById("mensagem");

let mapa;
let marcador;

function iniciarMapa() {
    mapa = L.map("mapa").setView([-23.0, -45.0], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(mapa);
}

function mostrarUltimaLocalizacao() {
    const localizacao = localStorage.getItem("localizacao");

    if (localizacao) {
        const dados = JSON.parse(localizacao);

        latitude.textContent = dados.latitude;
        longitude.textContent = dados.longitude;

        ultima.textContent =
            `Sua última localização salva foi: ${dados.latitude}, ${dados.longitude}`;

        if (dados.nome) {
            nomeLocal.textContent = dados.nome;
        }
    } else {
        ultima.textContent = "Nenhuma localização salva ainda.";
    }
}

async function identificarLocal(lat, long) {

    nomeLocal.textContent = "Identificando local...";

    try {

        const resposta = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}&zoom=18&addressdetails=1`,
            {
                headers: {
                    "Accept-Language": "pt-BR"
                }
            }
        );

        const dados = await resposta.json();
        const endereco = dados.address;

        let local = "";

        if (dados.name) {
            local = dados.name;
        } else if (endereco.road) {
            local = endereco.road;
        } else if (endereco.neighbourhood) {
            local = endereco.neighbourhood;
        }

        if (endereco.house_number) {
            local += `, ${endereco.house_number}`;
        }

        if (endereco.suburb) {
            local += ` - ${endereco.suburb}`;
        }

        if (endereco.city) {
            local += `, ${endereco.city}`;
        } else if (endereco.town) {
            local += `, ${endereco.town}`;
        } else if (endereco.village) {
            local += `, ${endereco.village}`;
        }

        if (endereco.state) {
            local += ` - ${endereco.state}`;
        }

        if (!local) {
            local = "Local não identificado";
        }

        nomeLocal.textContent = local;

        const localizacao = localStorage.getItem("localizacao");

        if (localizacao) {
            const dadosSalvos = JSON.parse(localizacao);

            dadosSalvos.nome = local;

            localStorage.setItem(
                "localizacao",
                JSON.stringify(dadosSalvos)
            );
        }

    } catch (erro) {

        nomeLocal.textContent =
            "Não foi possível identificar o local.";
    }
}

function pegarLocalizacao() {

    if (!navigator.geolocation) {
        status.textContent = "Seu navegador não suporta GPS.";
        sinal.style.color = "#e74c3c";
        return;
    }

    status.textContent = "Obtendo sua localização...";
    nomeLocal.textContent = "Identificando local...";
    sinal.style.color = "#f1c40f";

    navigator.geolocation.getCurrentPosition(

        function (posicao) {

            const lat = posicao.coords.latitude;
            const long = posicao.coords.longitude;

            const latFormatada = lat.toFixed(6);
            const longFormatada = long.toFixed(6);

            latitude.textContent = latFormatada;
            longitude.textContent = longFormatada;

            status.textContent = "Localização encontrada";

            localStorage.setItem(
                "localizacao",
                JSON.stringify({
                    latitude: latFormatada,
                    longitude: longFormatada
                })
            );

            ultima.textContent =
                `Sua última localização salva foi: ${latFormatada}, ${longFormatada}`;

            identificarLocal(lat, long);

            mapa.setView([lat, long], 17);

            if (marcador) {
                mapa.removeLayer(marcador);
            }

            marcador = L.marker([lat, long])
                .addTo(mapa)
                .bindPopup("<strong>Você está aqui!</strong>")
                .openPopup();

            sinal.style.color = "#27ae60";
        },

        function () {

            status.textContent =
                "Não foi possível obter sua localização.";

            nomeLocal.textContent =
                "Localização indisponível";

            sinal.style.color = "#e74c3c";
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

atualizar.addEventListener("click", pegarLocalizacao);

papel.addEventListener("dragstart", function () {
    lixeira.classList.add("destino");
});

papel.addEventListener("dragend", function () {
    lixeira.classList.remove("destino");
});

lixeira.addEventListener("dragover", function (event) {
    event.preventDefault();
});

lixeira.addEventListener("dragenter", function (event) {
    event.preventDefault();
    lixeira.classList.add("destino");
});

lixeira.addEventListener("dragleave", function () {
    lixeira.classList.remove("destino");
});

lixeira.addEventListener("drop", function (event) {

    event.preventDefault();

    localStorage.clear();

    latitude.textContent = "--";
    longitude.textContent = "--";

    nomeLocal.textContent = "Nenhuma localização";

    status.textContent = "Localização apagada";

    ultima.textContent =
        "Nenhuma localização salva ainda.";

    sinal.style.color = "#e74c3c";

    lixeira.classList.remove("destino");

    if (marcador) {
        mapa.removeLayer(marcador);
        marcador = null;
    }

    mapa.setView([-23.0, -45.0], 5);

    mensagem.classList.add("mostrar");

    setTimeout(function () {
        mensagem.classList.remove("mostrar");
    }, 2500);
});

iniciarMapa();
mostrarUltimaLocalizacao();
pegarLocalizacao();
