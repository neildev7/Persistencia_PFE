const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");
const status = document.getElementById("status");
const ultima = document.getElementById("ultima");
const sinal = document.getElementById("sinal");
const atualizar = document.getElementById("atualizar");

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

        ultima.textContent =
            `Sua última localização salva foi: ${dados.latitude}, ${dados.longitude}`;
    } else {
        ultima.textContent = "Nenhuma localização salva ainda.";
    }
}

function pegarLocalizacao() {

    if (!navigator.geolocation) {
        status.textContent = "Seu navegador não suporta GPS.";
        sinal.textContent = "●";
        return;
    }

    status.textContent = "Obtendo sua localização...";
    sinal.textContent = "●";

    navigator.geolocation.getCurrentPosition(

        function (posicao) {

            const lat = posicao.coords.latitude;
            const long = posicao.coords.longitude;

            latitude.textContent = lat.toFixed(6);
            longitude.textContent = long.toFixed(6);

            status.textContent = "Localização encontrada";

            localStorage.setItem(
                "localizacao",
                JSON.stringify({
                    latitude: lat.toFixed(6),
                    longitude: long.toFixed(6)
                })
            );

            ultima.textContent =
                `Sua última localização salva foi: ${lat.toFixed(6)}, ${long.toFixed(6)}`;

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

    status.textContent = "Localização apagada";

    ultima.textContent =
        "Nenhuma localização salva ainda.";

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
