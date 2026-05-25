import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import AppNav from '../../components/app-nav/app-nav';

import imagemMapaCompleto from '../../assets/backgrounds/fundo-mapa.png';

export default function MapPage() {
  const mapWidth = 1402;
  const mapHeight = 1122;
  const bounds = [[0, 0], [mapHeight, mapWidth]];
  const mapStartPosition = [842, 631];

  const createEmojiMarker = (emoji) => {
    return L.divIcon({
      html: `<div class="custom-marker-icon">${emoji}</div>`,
      className: 'leaflet-marker-custom',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  };

  const pontosDeInteresse = [
    { id: 1, nome: 'Portao Inicial', coordenadas: [281, 421], emoji: '🚪', descricao: 'Onde tudo comeca!' },
    { id: 2, nome: 'Lago Misterioso', coordenadas: [561, 981], emoji: '⚓', descricao: 'Um quiz profundo espera por voce aqui.' },
    { id: 3, nome: 'Bau de Reliquias', coordenadas: mapStartPosition, emoji: '🏴‍☠️', descricao: 'Desbloqueie para pegar sua pista final!' }
  ];

  return (
    <div className="map-page-container">
      <MapContainer
        crs={L.CRS.Simple}
        center={mapStartPosition}
        zoom={1}
        minZoom={0}
        maxZoom={2}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        zoomSnap={0.5}
        zoomControl={false}
      >
        <ImageOverlay url={imagemMapaCompleto} bounds={bounds} />

        {pontosDeInteresse.map((ponto) => (
          <Marker
            key={ponto.id}
            position={ponto.coordenadas}
            icon={createEmojiMarker(ponto.emoji)}
          >
            <Popup>
              <div className="map-popup-content">
                <b className="map-popup-title">{ponto.nome}</b>
                <p className="map-popup-description">{ponto.descricao}</p>
                <button
                  className="map-popup-button"
                  onClick={() => alert(`Iniciando desafio do ponto ${ponto.nome}!`)}
                >
                  Jogar
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <AppNav floating />
    </div>
  );
}
