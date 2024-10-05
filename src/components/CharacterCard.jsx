import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css';


const CharacterCard = () => {
    const [character, setCharacter] = useState(null);
    const [starships, setStarships] = useState(null);
    const [species, setSpecies] = useState(null);
    const [vehicles, setVehicles] = useState(null);
    const [films, setFilms] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    // Состояние для загрузки изображения
    const [imageLoading, setImageLoading] = useState(true);
    //Хук для перемещения по страницам с разным id в url
    const navigate = useNavigate();
    //Хук для получения параметров из url
    const location = useLocation();

    //Получение рандомного значения id от 1 до 100
    const getRandomId = () => Math.floor(Math.random() * 100) + 1;
    //Получаем id из запроса
    const getIdFromUrl = () => new URLSearchParams(location.search).get('id') || 1;

    //Получить информацию о персонаже с нужным id
    const fetchCharacter = (id) => {
        setError('');
        //Устанавливаем стейт в true, для того, чтобы появилась анимация ожидания загрузки
        setLoading(true);
        setStarships(null);
        setSpecies(null);
        setVehicles(null);
        setFilms(null);
        // Устанавливаем состояние загрузки изображения в true
        setImageLoading(true);

        //Обращаемся к API по выбранному id
        fetch(`https://swapi.dev/api/people/${id}/`)
            .then((res) => res.json())
            .then((data) => {
                //Сохраняем в стейт полученные данные от API
                setCharacter(data);
                //Добавляем в url id
                navigate(`?id=${id}`);
                //Запрашиваем у API информацию о кораблях, расе, сресдствах передвижения
                fetchAdditionalData(data);
            })
            .catch(() => setError('Character not found or API error.'))
            .finally(() => setLoading(false)); // Устанавливаем состояние загрузки в false после завершения
    };

    const fetchAdditionalData = (data) => {
        //Обращаемся к API по нужному url, передаем state для сохранения полученных данных, а также
        //параметр title для того, чтобы понимать, работаем с фильмами
        const fetchData = (urls, setState, errorMessage, titleField) => {
            if (urls.length > 0) {
                //проходимся по массиву ссылок и обрабатываем их
                Promise.all(urls.map((url) => fetch(url).then((res) => res.json())))
                    .then((results) => {
                        // Используем указанное поле, если оно передано
                        const titles = titleField
                            ? results.map((item) => item[titleField])
                            : results.map((item) => item.name);
                        setState(titles);
                    })
                    .catch(() => setState([errorMessage]));
            } else {
                setState([]);
            }
        };
        //Делаем запрос для получения информации о кораблях, расы,средствах передвижения и фильмах с персонажем
        fetchData(data.starships, setStarships, 'Error loading starships');
        fetchData(data.species, setSpecies, 'Error loading species');
        fetchData(data.vehicles, setVehicles, 'Error loading vehicles');
        fetchData(data.films, setFilms, 'Error loading films', 'title'); // Передаем 'title' для фильмов
    };

    //При рендере компонента получаем Id и запрашиваем данные у API
    useEffect(() => {
        const id = getIdFromUrl();
        fetchCharacter(id);
    }, []);

    //Обработчик кнопки для получения нового персонажа
    const handleRandomCharacter = () => {
        const randomId = getRandomId();
        fetchCharacter(randomId);
    };

    const renderNoInfo= () => {
        return <span> &nbsp;—&nbsp; </span>
    }
    const renderData = (data) => {
        // Проверяем состояния и отображаем анимацию загрузки или сообщение об отсутствии данных
        if (loading || data === null) {
            return <span className="skeleton"></span>; // Анимация загрузки
        }
        // Если данных нет, отображаем сообщение
        if (data.length === 0) {
            return renderNoInfo(); // Сообщение об отсутствии информации
        }

        // Возвращаем данные через запятую
        return data.join(', ');
    };

    //Получение html строки по определенной характеристике
    const renderInfo = (label, value) => (
        <p>
            <span className="shadowText">{label}:</span>
            {loading ? (
                <span className="skeleton"></span>
            ) : (value === 'none' || value === 'unknown') ? (
                renderNoInfo()
            ) : (
                value
            )}
        </p>
    );


    const renderAddInfo = (label, data) => (
        <p>
            <span className="shadowText">{label}:</span>
            {renderData(data)}
        </p>
    );

    const renderImage = () => (
        <div className="img-wrapper">
            {imageLoading && <div className="image-loader"></div>}
            <img
                src={`https://starwars-visualguide.com/assets/img/characters/${getIdFromUrl()}.jpg`}
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://starwars-visualguide.com/assets/img/placeholder.jpg';
                }}
                alt={character.name}
                style={imageLoading ? { display: 'none' } : {}}
            />
        </div>
    );

    return (
        <div className="container">
            {error ? (
                <div className="text-red-500">{error}</div>
            ) : character ? (
                <div className="card">
                    {renderImage()}
                    <div className="card-body">
                        <h2>{character.name}</h2>
                        {renderInfo('Height', character.height)}
                        {renderInfo('Mass', character.mass)}
                        {renderInfo('Hair Color', character.hair_color)}
                        {renderInfo('Eye Color', character.eye_color)}
                        {renderInfo('Birth Year', character.birth_year)}
                        {renderInfo('Gender', character.gender)}
                        {renderInfo('Skin Color', character.skin_color)}

                        <div className="data-container">
                            {renderAddInfo('Starships', starships)}
                            {renderAddInfo('Species', species)}
                            {renderAddInfo('Vehicles', vehicles)}
                            {renderAddInfo('Films', films)}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="loader"></div>
            )}
            <button className="btnRandom" onClick={handleRandomCharacter}>
                Load Another Character
            </button>
        </div>
    );
};

export default CharacterCard;
