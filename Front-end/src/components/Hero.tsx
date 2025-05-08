import React from "react";
import { Link } from "react-router-dom";
import { SearchIcon, MapPinIcon, CalendarIcon } from "lucide-react";
import "../styles/Homepage.css";

const HomePage = () => {
  const destinos = [
    {
      name: "Rio de Janeiro",
      image:
        "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      name: "Fernando de Noronha",
      image:
        "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      name: "Gramado",
      image:
        "https://media.istockphoto.com/id/688523034/pt/foto/street-and-architecture-of-gramado-city-gramado-rio-grande-do-sul-brazil.jpg?s=612x612&w=0&k=20&c=5gjKXS9xhuNDon5B8thNNpoyQnzFf-amaHn9Ypsya18=",
    },
    {
      name: "Salvador",
      image:
        "https://images.unsplash.com/photo-1550686041-366ad85a1355?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      name: "Florianópolis",
      image:
        "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      name: "Bonito",
      image:
        "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Planeje sua viagem dos sonhos</h1>
          <p className="hero-subtitle">
            Roteiros personalizados baseados nas suas preferências
          </p>
          <Link to="/Login" className="hero-button">
            Comece Agora
          </Link>
        </div>
      </div>

      {/* Como Funciona */}
      <div className="section">
        <h2 className="section-title">Como Funciona</h2>
        <div className="card-grid">
          <div className="card">
            <div className="card-icon">
              <SearchIcon className="icon" />
            </div>
            <h3 className="card-title">1. Cadastre suas preferências</h3>
            <p className="card-description">
              Informe seu orçamento, destino desejado e estilo de viagem.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">
              <MapPinIcon className="icon" />
            </div>
            <h3 className="card-title">2. Receba roteiros personalizados</h3>
            <p className="card-description">
              Nosso sistema gera roteiros com atrações, hospedagens e
              transportes.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">
              <CalendarIcon className="icon" />
            </div>
            <h3 className="card-title">3. Reserve e viaje</h3>
            <p className="card-description">
              Faça reservas diretamente pelo site e aproveite sua viagem.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Preferências
      <div className="section section-gray">
        <h2 className="section-title">Planeje sua próxima aventura</h2>
        
      </div> */}

      {/* Destinos Populares */}

      <div className="section">
        <h2 className="section-title">Destinos Populares</h2>
        <div className="destination-grid">
          {destinos.map((destino, index) => (
            <div key={index} className="destination-card">
              <img src={destino.image} alt={destino.name} />
              <div className="destination-overlay">
                <h3>{destino.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;