/* ============================================================
   EL IMPOSTOR — Word Database (Spanish)
   ============================================================
   Format aligned with Data Architect schema:
   - Each word: { id, text, difficulty(1-5), frequency(1-5), hint }
   - Each pair: { word, similarity(0-1), tier('A'|'B'|'C') }
   ============================================================ */

export const WORD_DATABASE = {
    categories: [
        {
            id: 'animals', name: 'Animales', emoji: '🐾', premium: false,
            words: [
                { id: 'an_01', text: 'Perro', difficulty: 1, frequency: 5, hint: 'Animal doméstico', pairs: [{ word: 'Lobo', similarity: 0.82, tier: 'A' }, { word: 'Gato', similarity: 0.60, tier: 'C' }, { word: 'Zorro', similarity: 0.75, tier: 'B' }] },
                { id: 'an_02', text: 'Gato', difficulty: 1, frequency: 5, hint: 'Animal doméstico', pairs: [{ word: 'Pantera', similarity: 0.70, tier: 'B' }, { word: 'Lince', similarity: 0.78, tier: 'A' }, { word: 'Tigre', similarity: 0.65, tier: 'B' }] },
                { id: 'an_03', text: 'León', difficulty: 2, frequency: 4, hint: 'Felino salvaje', pairs: [{ word: 'Tigre', similarity: 0.88, tier: 'A' }, { word: 'Puma', similarity: 0.82, tier: 'A' }, { word: 'Leopardo', similarity: 0.85, tier: 'A' }] },
                { id: 'an_04', text: 'Águila', difficulty: 2, frequency: 4, hint: 'Ave rapaz', pairs: [{ word: 'Halcón', similarity: 0.87, tier: 'A' }, { word: 'Búho', similarity: 0.60, tier: 'C' }, { word: 'Cóndor', similarity: 0.80, tier: 'A' }] },
                { id: 'an_05', text: 'Tiburón', difficulty: 2, frequency: 4, hint: 'Depredador marino', pairs: [{ word: 'Delfín', similarity: 0.65, tier: 'B' }, { word: 'Orca', similarity: 0.78, tier: 'A' }, { word: 'Ballena', similarity: 0.62, tier: 'B' }] },
                { id: 'an_06', text: 'Elefante', difficulty: 1, frequency: 5, hint: 'Animal grande terrestre', pairs: [{ word: 'Rinoceronte', similarity: 0.75, tier: 'B' }, { word: 'Hipopótamo', similarity: 0.72, tier: 'B' }, { word: 'Mamut', similarity: 0.88, tier: 'A' }] },
                { id: 'an_07', text: 'Serpiente', difficulty: 3, frequency: 3, hint: 'Reptil alargado', pairs: [{ word: 'Lagarto', similarity: 0.70, tier: 'B' }, { word: 'Cocodrilo', similarity: 0.60, tier: 'C' }, { word: 'Iguana', similarity: 0.72, tier: 'B' }] },
                { id: 'an_08', text: 'Caballo', difficulty: 1, frequency: 5, hint: 'Animal de monta', pairs: [{ word: 'Burro', similarity: 0.80, tier: 'A' }, { word: 'Cebra', similarity: 0.78, tier: 'A' }, { word: 'Poni', similarity: 0.90, tier: 'A' }] },
                { id: 'an_09', text: 'Oso', difficulty: 1, frequency: 5, hint: 'Mamífero del bosque', pairs: [{ word: 'Panda', similarity: 0.85, tier: 'A' }, { word: 'Koala', similarity: 0.60, tier: 'C' }, { word: 'Mapache', similarity: 0.55, tier: 'C' }] },
                { id: 'an_10', text: 'Mono', difficulty: 2, frequency: 4, hint: 'Primate', pairs: [{ word: 'Gorila', similarity: 0.85, tier: 'A' }, { word: 'Chimpancé', similarity: 0.90, tier: 'A' }, { word: 'Orangután', similarity: 0.88, tier: 'A' }] },
                { id: 'an_11', text: 'Conejo', difficulty: 1, frequency: 5, hint: 'Roedor pequeño', pairs: [{ word: 'Liebre', similarity: 0.92, tier: 'A' }, { word: 'Hámster', similarity: 0.60, tier: 'C' }, { word: 'Ratón', similarity: 0.55, tier: 'C' }] },
                { id: 'an_12', text: 'Ballena', difficulty: 2, frequency: 4, hint: 'Mamífero marino', pairs: [{ word: 'Delfín', similarity: 0.75, tier: 'B' }, { word: 'Foca', similarity: 0.58, tier: 'C' }, { word: 'Morsa', similarity: 0.62, tier: 'B' }] },
                { id: 'an_13', text: 'Pingüino', difficulty: 2, frequency: 4, hint: 'Ave polar', pairs: [{ word: 'Foca', similarity: 0.55, tier: 'C' }, { word: 'Gaviota', similarity: 0.50, tier: 'C' }, { word: 'Albatros', similarity: 0.65, tier: 'B' }] },
                { id: 'an_14', text: 'Tortuga', difficulty: 2, frequency: 4, hint: 'Reptil con caparazón', pairs: [{ word: 'Caracol', similarity: 0.55, tier: 'C' }, { word: 'Cangrejo', similarity: 0.50, tier: 'C' }, { word: 'Lagarto', similarity: 0.62, tier: 'B' }] },
                { id: 'an_15', text: 'Loro', difficulty: 2, frequency: 4, hint: 'Ave tropical', pairs: [{ word: 'Tucán', similarity: 0.78, tier: 'A' }, { word: 'Guacamayo', similarity: 0.90, tier: 'A' }, { word: 'Canario', similarity: 0.65, tier: 'B' }] },
                { id: 'an_16', text: 'Araña', difficulty: 3, frequency: 3, hint: 'Arácnido', pairs: [{ word: 'Escorpión', similarity: 0.72, tier: 'B' }, { word: 'Hormiga', similarity: 0.55, tier: 'C' }, { word: 'Escarabajo', similarity: 0.60, tier: 'C' }] },
                { id: 'an_17', text: 'Mariposa', difficulty: 3, frequency: 3, hint: 'Insecto volador', pairs: [{ word: 'Libélula', similarity: 0.78, tier: 'A' }, { word: 'Abeja', similarity: 0.55, tier: 'C' }, { word: 'Polilla', similarity: 0.88, tier: 'A' }] },
                { id: 'an_18', text: 'Ciervo', difficulty: 3, frequency: 3, hint: 'Herbívoro del bosque', pairs: [{ word: 'Alce', similarity: 0.85, tier: 'A' }, { word: 'Reno', similarity: 0.88, tier: 'A' }, { word: 'Gacela', similarity: 0.75, tier: 'B' }] },
                { id: 'an_19', text: 'Ratón', difficulty: 1, frequency: 5, hint: 'Roedor pequeño', pairs: [{ word: 'Rata', similarity: 0.92, tier: 'A' }, { word: 'Hámster', similarity: 0.70, tier: 'B' }, { word: 'Ardilla', similarity: 0.58, tier: 'C' }] },
                { id: 'an_20', text: 'Jirafa', difficulty: 2, frequency: 4, hint: 'Animal alto africano', pairs: [{ word: 'Avestruz', similarity: 0.50, tier: 'C' }, { word: 'Camello', similarity: 0.55, tier: 'C' }, { word: 'Llama', similarity: 0.52, tier: 'C' }] },
            ]
        },
        {
            id: 'food', name: 'Comida y Bebida', emoji: '🍕', premium: false,
            words: [
                { id: 'fo_01', text: 'Pizza', difficulty: 1, frequency: 5, hint: 'Comida italiana', pairs: [{ word: 'Calzone', similarity: 0.88, tier: 'A' }, { word: 'Focaccia', similarity: 0.72, tier: 'B' }, { word: 'Empanada', similarity: 0.65, tier: 'B' }] },
                { id: 'fo_02', text: 'Hamburguesa', difficulty: 1, frequency: 5, hint: 'Comida rápida', pairs: [{ word: 'Hot Dog', similarity: 0.75, tier: 'B' }, { word: 'Sándwich', similarity: 0.78, tier: 'A' }, { word: 'Kebab', similarity: 0.60, tier: 'C' }] },
                { id: 'fo_03', text: 'Sushi', difficulty: 2, frequency: 4, hint: 'Comida japonesa', pairs: [{ word: 'Sashimi', similarity: 0.90, tier: 'A' }, { word: 'Tempura', similarity: 0.70, tier: 'B' }, { word: 'Ramen', similarity: 0.62, tier: 'B' }] },
                { id: 'fo_04', text: 'Paella', difficulty: 3, frequency: 3, hint: 'Plato de arroz', pairs: [{ word: 'Risotto', similarity: 0.78, tier: 'A' }, { word: 'Arroz frito', similarity: 0.72, tier: 'B' }, { word: 'Fideuá', similarity: 0.85, tier: 'A' }] },
                { id: 'fo_05', text: 'Chocolate', difficulty: 1, frequency: 5, hint: 'Dulce de cacao', pairs: [{ word: 'Cacao', similarity: 0.88, tier: 'A' }, { word: 'Brownie', similarity: 0.70, tier: 'B' }, { word: 'Turrón', similarity: 0.55, tier: 'C' }] },
                { id: 'fo_06', text: 'Café', difficulty: 1, frequency: 5, hint: 'Bebida caliente', pairs: [{ word: 'Té', similarity: 0.75, tier: 'B' }, { word: 'Capuchino', similarity: 0.88, tier: 'A' }, { word: 'Espresso', similarity: 0.92, tier: 'A' }] },
                { id: 'fo_07', text: 'Cerveza', difficulty: 2, frequency: 4, hint: 'Bebida alcohólica', pairs: [{ word: 'Sidra', similarity: 0.78, tier: 'A' }, { word: 'Vino', similarity: 0.72, tier: 'B' }, { word: 'Limonada', similarity: 0.45, tier: 'C' }] },
                { id: 'fo_08', text: 'Helado', difficulty: 1, frequency: 5, hint: 'Postre frío', pairs: [{ word: 'Sorbete', similarity: 0.88, tier: 'A' }, { word: 'Granizado', similarity: 0.75, tier: 'B' }, { word: 'Natillas', similarity: 0.55, tier: 'C' }] },
                { id: 'fo_09', text: 'Tortilla', difficulty: 2, frequency: 4, hint: 'Plato de huevo', pairs: [{ word: 'Omelette', similarity: 0.90, tier: 'A' }, { word: 'Frittata', similarity: 0.85, tier: 'A' }, { word: 'Revuelto', similarity: 0.72, tier: 'B' }] },
                { id: 'fo_10', text: 'Croissant', difficulty: 3, frequency: 3, hint: 'Bollería dulce', pairs: [{ word: 'Donut', similarity: 0.65, tier: 'B' }, { word: 'Magdalena', similarity: 0.70, tier: 'B' }, { word: 'Churro', similarity: 0.60, tier: 'C' }] },
                { id: 'fo_11', text: 'Taco', difficulty: 2, frequency: 4, hint: 'Comida mexicana', pairs: [{ word: 'Burrito', similarity: 0.85, tier: 'A' }, { word: 'Quesadilla', similarity: 0.80, tier: 'A' }, { word: 'Enchilada', similarity: 0.82, tier: 'A' }] },
                { id: 'fo_12', text: 'Pasta', difficulty: 1, frequency: 5, hint: 'Plato de trigo', pairs: [{ word: 'Fideos', similarity: 0.88, tier: 'A' }, { word: 'Lasaña', similarity: 0.78, tier: 'A' }, { word: 'Macarrones', similarity: 0.85, tier: 'A' }] },
                { id: 'fo_13', text: 'Ensalada', difficulty: 1, frequency: 5, hint: 'Plato de verduras', pairs: [{ word: 'Gazpacho', similarity: 0.55, tier: 'C' }, { word: 'Ceviche', similarity: 0.50, tier: 'C' }, { word: 'Carpaccio', similarity: 0.48, tier: 'C' }] },
                { id: 'fo_14', text: 'Manzana', difficulty: 1, frequency: 5, hint: 'Fruta común', pairs: [{ word: 'Pera', similarity: 0.88, tier: 'A' }, { word: 'Melocotón', similarity: 0.78, tier: 'A' }, { word: 'Ciruela', similarity: 0.75, tier: 'B' }] },
                { id: 'fo_15', text: 'Queso', difficulty: 1, frequency: 5, hint: 'Lácteo sólido', pairs: [{ word: 'Mantequilla', similarity: 0.72, tier: 'B' }, { word: 'Yogur', similarity: 0.70, tier: 'B' }, { word: 'Nata', similarity: 0.68, tier: 'B' }] },
                { id: 'fo_16', text: 'Pan', difficulty: 1, frequency: 5, hint: 'Alimento de harina', pairs: [{ word: 'Galleta', similarity: 0.60, tier: 'C' }, { word: 'Tostada', similarity: 0.85, tier: 'A' }, { word: 'Arepa', similarity: 0.72, tier: 'B' }] },
                { id: 'fo_17', text: 'Limonada', difficulty: 1, frequency: 5, hint: 'Bebida de fruta', pairs: [{ word: 'Naranjada', similarity: 0.92, tier: 'A' }, { word: 'Zumo', similarity: 0.78, tier: 'A' }, { word: 'Horchata', similarity: 0.60, tier: 'C' }] },
                { id: 'fo_18', text: 'Fresa', difficulty: 2, frequency: 4, hint: 'Fruta roja', pairs: [{ word: 'Frambuesa', similarity: 0.90, tier: 'A' }, { word: 'Cereza', similarity: 0.78, tier: 'A' }, { word: 'Mora', similarity: 0.85, tier: 'A' }] },
                { id: 'fo_19', text: 'Pollo', difficulty: 1, frequency: 5, hint: 'Carne de ave', pairs: [{ word: 'Pavo', similarity: 0.85, tier: 'A' }, { word: 'Pato', similarity: 0.82, tier: 'A' }, { word: 'Codorniz', similarity: 0.72, tier: 'B' }] },
                { id: 'fo_20', text: 'Sopa', difficulty: 1, frequency: 5, hint: 'Plato líquido caliente', pairs: [{ word: 'Caldo', similarity: 0.90, tier: 'A' }, { word: 'Crema', similarity: 0.78, tier: 'A' }, { word: 'Guiso', similarity: 0.72, tier: 'B' }] },
            ]
        },
        {
            id: 'sports', name: 'Deportes', emoji: '⚽', premium: false,
            words: [
                { id: 'sp_01', text: 'Fútbol', difficulty: 1, frequency: 5, hint: 'Deporte de balón', pairs: [{ word: 'Rugby', similarity: 0.72, tier: 'B' }, { word: 'Fútbol sala', similarity: 0.92, tier: 'A' }, { word: 'Hockey', similarity: 0.62, tier: 'B' }] },
                { id: 'sp_02', text: 'Baloncesto', difficulty: 1, frequency: 5, hint: 'Deporte de canasta', pairs: [{ word: 'Voleibol', similarity: 0.72, tier: 'B' }, { word: 'Balonmano', similarity: 0.82, tier: 'A' }, { word: 'Netball', similarity: 0.78, tier: 'A' }] },
                { id: 'sp_03', text: 'Tenis', difficulty: 1, frequency: 5, hint: 'Deporte de raqueta', pairs: [{ word: 'Bádminton', similarity: 0.85, tier: 'A' }, { word: 'Pádel', similarity: 0.88, tier: 'A' }, { word: 'Ping-pong', similarity: 0.82, tier: 'A' }] },
                { id: 'sp_04', text: 'Natación', difficulty: 2, frequency: 4, hint: 'Deporte acuático', pairs: [{ word: 'Waterpolo', similarity: 0.75, tier: 'B' }, { word: 'Buceo', similarity: 0.68, tier: 'B' }, { word: 'Surf', similarity: 0.55, tier: 'C' }] },
                { id: 'sp_05', text: 'Ciclismo', difficulty: 2, frequency: 4, hint: 'Deporte sobre ruedas', pairs: [{ word: 'Patinaje', similarity: 0.62, tier: 'B' }, { word: 'Monopatín', similarity: 0.55, tier: 'C' }, { word: 'BMX', similarity: 0.85, tier: 'A' }] },
                { id: 'sp_06', text: 'Boxeo', difficulty: 2, frequency: 4, hint: 'Deporte de contacto', pairs: [{ word: 'Karate', similarity: 0.78, tier: 'A' }, { word: 'Judo', similarity: 0.75, tier: 'B' }, { word: 'Lucha libre', similarity: 0.82, tier: 'A' }] },
                { id: 'sp_07', text: 'Golf', difficulty: 3, frequency: 3, hint: 'Deporte de precisión', pairs: [{ word: 'Billar', similarity: 0.50, tier: 'C' }, { word: 'Croquet', similarity: 0.72, tier: 'B' }, { word: 'Bolos', similarity: 0.55, tier: 'C' }] },
                { id: 'sp_08', text: 'Atletismo', difficulty: 2, frequency: 4, hint: 'Deporte de carrera', pairs: [{ word: 'Maratón', similarity: 0.82, tier: 'A' }, { word: 'Triatlón', similarity: 0.78, tier: 'A' }, { word: 'Cross', similarity: 0.85, tier: 'A' }] },
                { id: 'sp_09', text: 'Esquí', difficulty: 3, frequency: 3, hint: 'Deporte de nieve', pairs: [{ word: 'Snowboard', similarity: 0.88, tier: 'A' }, { word: 'Patinaje hielo', similarity: 0.72, tier: 'B' }, { word: 'Trineo', similarity: 0.65, tier: 'B' }] },
                { id: 'sp_10', text: 'Surf', difficulty: 3, frequency: 3, hint: 'Deporte de olas', pairs: [{ word: 'Windsurf', similarity: 0.90, tier: 'A' }, { word: 'Kayak', similarity: 0.58, tier: 'C' }, { word: 'Bodyboard', similarity: 0.88, tier: 'A' }] },
                { id: 'sp_11', text: 'Béisbol', difficulty: 3, frequency: 3, hint: 'Deporte de bate', pairs: [{ word: 'Softball', similarity: 0.90, tier: 'A' }, { word: 'Cricket', similarity: 0.72, tier: 'B' }, { word: 'Rounders', similarity: 0.78, tier: 'A' }] },
                { id: 'sp_12', text: 'Escalada', difficulty: 3, frequency: 3, hint: 'Deporte de montaña', pairs: [{ word: 'Senderismo', similarity: 0.70, tier: 'B' }, { word: 'Rappel', similarity: 0.82, tier: 'A' }, { word: 'Espeleología', similarity: 0.60, tier: 'C' }] },
                { id: 'sp_13', text: 'Gimnasia', difficulty: 2, frequency: 4, hint: 'Ejercicio corporal', pairs: [{ word: 'Yoga', similarity: 0.65, tier: 'B' }, { word: 'Pilates', similarity: 0.68, tier: 'B' }, { word: 'Danza', similarity: 0.60, tier: 'C' }] },
                { id: 'sp_14', text: 'Esgrima', difficulty: 4, frequency: 2, hint: 'Deporte con espada', pairs: [{ word: 'Tiro con arco', similarity: 0.62, tier: 'B' }, { word: 'Lanzamiento', similarity: 0.50, tier: 'C' }, { word: 'Jabalina', similarity: 0.55, tier: 'C' }] },
                { id: 'sp_15', text: 'Ajedrez', difficulty: 2, frequency: 4, hint: 'Juego de tablero', pairs: [{ word: 'Damas', similarity: 0.82, tier: 'A' }, { word: 'Go', similarity: 0.75, tier: 'B' }, { word: 'Backgammon', similarity: 0.72, tier: 'B' }] },
                { id: 'sp_16', text: 'Fórmula 1', difficulty: 2, frequency: 4, hint: 'Competición de coches', pairs: [{ word: 'Rally', similarity: 0.82, tier: 'A' }, { word: 'NASCAR', similarity: 0.88, tier: 'A' }, { word: 'MotoGP', similarity: 0.78, tier: 'A' }] },
                { id: 'sp_17', text: 'Skate', difficulty: 3, frequency: 3, hint: 'Deporte urbano', pairs: [{ word: 'Scooter', similarity: 0.65, tier: 'B' }, { word: 'Roller', similarity: 0.72, tier: 'B' }, { word: 'Longboard', similarity: 0.90, tier: 'A' }] },
                { id: 'sp_18', text: 'Polo', difficulty: 4, frequency: 2, hint: 'Deporte con caballo', pairs: [{ word: 'Equitación', similarity: 0.78, tier: 'A' }, { word: 'Hípica', similarity: 0.82, tier: 'A' }, { word: 'Rodeo', similarity: 0.60, tier: 'C' }] },
                { id: 'sp_19', text: 'Rugby', difficulty: 2, frequency: 4, hint: 'Deporte de balón ovalado', pairs: [{ word: 'Fútbol americano', similarity: 0.85, tier: 'A' }, { word: 'Lacrosse', similarity: 0.68, tier: 'B' }, { word: 'Hurling', similarity: 0.60, tier: 'C' }] },
                { id: 'sp_20', text: 'Vela', difficulty: 4, frequency: 2, hint: 'Deporte náutico', pairs: [{ word: 'Remo', similarity: 0.72, tier: 'B' }, { word: 'Piragüismo', similarity: 0.78, tier: 'A' }, { word: 'Canoa', similarity: 0.80, tier: 'A' }] },
            ]
        },
        {
            id: 'places', name: 'Países y Ciudades', emoji: '🌍', premium: false,
            words: [
                { id: 'pl_01', text: 'París', difficulty: 1, frequency: 5, hint: 'Capital europea', pairs: [{ word: 'Londres', similarity: 0.82, tier: 'A' }, { word: 'Roma', similarity: 0.85, tier: 'A' }, { word: 'Berlín', similarity: 0.78, tier: 'A' }] },
                { id: 'pl_02', text: 'Tokio', difficulty: 2, frequency: 4, hint: 'Capital asiática', pairs: [{ word: 'Seúl', similarity: 0.82, tier: 'A' }, { word: 'Pekín', similarity: 0.78, tier: 'A' }, { word: 'Osaka', similarity: 0.90, tier: 'A' }] },
                { id: 'pl_03', text: 'Nueva York', difficulty: 1, frequency: 5, hint: 'Ciudad estadounidense', pairs: [{ word: 'Chicago', similarity: 0.78, tier: 'A' }, { word: 'Los Ángeles', similarity: 0.82, tier: 'A' }, { word: 'Toronto', similarity: 0.68, tier: 'B' }] },
                { id: 'pl_04', text: 'España', difficulty: 1, frequency: 5, hint: 'País europeo', pairs: [{ word: 'Portugal', similarity: 0.85, tier: 'A' }, { word: 'Italia', similarity: 0.82, tier: 'A' }, { word: 'Francia', similarity: 0.80, tier: 'A' }] },
                { id: 'pl_05', text: 'Brasil', difficulty: 2, frequency: 4, hint: 'País sudamericano', pairs: [{ word: 'Argentina', similarity: 0.85, tier: 'A' }, { word: 'Colombia', similarity: 0.78, tier: 'A' }, { word: 'México', similarity: 0.72, tier: 'B' }] },
                { id: 'pl_06', text: 'Egipto', difficulty: 3, frequency: 3, hint: 'País africano', pairs: [{ word: 'Marruecos', similarity: 0.75, tier: 'B' }, { word: 'Turquía', similarity: 0.65, tier: 'B' }, { word: 'Grecia', similarity: 0.62, tier: 'B' }] },
                { id: 'pl_07', text: 'Australia', difficulty: 2, frequency: 4, hint: 'País isla', pairs: [{ word: 'Nueva Zelanda', similarity: 0.88, tier: 'A' }, { word: 'Canadá', similarity: 0.60, tier: 'C' }, { word: 'Sudáfrica', similarity: 0.55, tier: 'C' }] },
                { id: 'pl_08', text: 'Moscú', difficulty: 3, frequency: 3, hint: 'Capital del este', pairs: [{ word: 'San Petersburgo', similarity: 0.88, tier: 'A' }, { word: 'Varsovia', similarity: 0.72, tier: 'B' }, { word: 'Praga', similarity: 0.68, tier: 'B' }] },
                { id: 'pl_09', text: 'Amazonas', difficulty: 3, frequency: 3, hint: 'Río famoso', pairs: [{ word: 'Nilo', similarity: 0.85, tier: 'A' }, { word: 'Misisipi', similarity: 0.82, tier: 'A' }, { word: 'Ganges', similarity: 0.80, tier: 'A' }] },
                { id: 'pl_10', text: 'Sahara', difficulty: 3, frequency: 3, hint: 'Desierto grande', pairs: [{ word: 'Gobi', similarity: 0.88, tier: 'A' }, { word: 'Atacama', similarity: 0.85, tier: 'A' }, { word: 'Kalahari', similarity: 0.82, tier: 'A' }] },
                { id: 'pl_11', text: 'Alpes', difficulty: 3, frequency: 3, hint: 'Cordillera famosa', pairs: [{ word: 'Andes', similarity: 0.88, tier: 'A' }, { word: 'Himalaya', similarity: 0.85, tier: 'A' }, { word: 'Pirineos', similarity: 0.90, tier: 'A' }] },
                { id: 'pl_12', text: 'Hawái', difficulty: 2, frequency: 4, hint: 'Isla tropical', pairs: [{ word: 'Bali', similarity: 0.82, tier: 'A' }, { word: 'Maldivas', similarity: 0.78, tier: 'A' }, { word: 'Canarias', similarity: 0.80, tier: 'A' }] },
                { id: 'pl_13', text: 'Venecia', difficulty: 3, frequency: 3, hint: 'Ciudad con canales', pairs: [{ word: 'Ámsterdam', similarity: 0.68, tier: 'B' }, { word: 'Brujas', similarity: 0.72, tier: 'B' }, { word: 'Estocolmo', similarity: 0.55, tier: 'C' }] },
                { id: 'pl_14', text: 'Cuba', difficulty: 3, frequency: 3, hint: 'Isla caribeña', pairs: [{ word: 'Jamaica', similarity: 0.82, tier: 'A' }, { word: 'Puerto Rico', similarity: 0.85, tier: 'A' }, { word: 'Bahamas', similarity: 0.78, tier: 'A' }] },
                { id: 'pl_15', text: 'India', difficulty: 2, frequency: 4, hint: 'País de Asia', pairs: [{ word: 'Pakistán', similarity: 0.78, tier: 'A' }, { word: 'Bangladesh', similarity: 0.72, tier: 'B' }, { word: 'Sri Lanka', similarity: 0.75, tier: 'B' }] },
                { id: 'pl_16', text: 'Roma', difficulty: 1, frequency: 5, hint: 'Capital antigua', pairs: [{ word: 'Atenas', similarity: 0.82, tier: 'A' }, { word: 'Estambul', similarity: 0.68, tier: 'B' }, { word: 'El Cairo', similarity: 0.60, tier: 'C' }] },
                { id: 'pl_17', text: 'Dubái', difficulty: 2, frequency: 4, hint: 'Ciudad del golfo', pairs: [{ word: 'Abu Dabi', similarity: 0.92, tier: 'A' }, { word: 'Doha', similarity: 0.85, tier: 'A' }, { word: 'Riad', similarity: 0.78, tier: 'A' }] },
                { id: 'pl_18', text: 'Japón', difficulty: 1, frequency: 5, hint: 'País de Asia oriental', pairs: [{ word: 'Corea del Sur', similarity: 0.82, tier: 'A' }, { word: 'China', similarity: 0.75, tier: 'B' }, { word: 'Taiwán', similarity: 0.78, tier: 'A' }] },
                { id: 'pl_19', text: 'Alaska', difficulty: 3, frequency: 3, hint: 'Territorio frío', pairs: [{ word: 'Siberia', similarity: 0.85, tier: 'A' }, { word: 'Groenlandia', similarity: 0.82, tier: 'A' }, { word: 'Islandia', similarity: 0.72, tier: 'B' }] },
                { id: 'pl_20', text: 'Hollywood', difficulty: 2, frequency: 4, hint: 'Barrio del cine', pairs: [{ word: 'Bollywood', similarity: 0.90, tier: 'A' }, { word: 'Broadway', similarity: 0.75, tier: 'B' }, { word: 'Las Vegas', similarity: 0.58, tier: 'C' }] },
            ]
        },
        {
            id: 'movies', name: 'Cine y TV', emoji: '🎬', premium: false,
            words: [
                { id: 'mv_01', text: 'Star Wars', difficulty: 1, frequency: 5, hint: 'Saga espacial', pairs: [{ word: 'Star Trek', similarity: 0.88, tier: 'A' }, { word: 'Guardians', similarity: 0.68, tier: 'B' }, { word: 'Dune', similarity: 0.72, tier: 'B' }] },
                { id: 'mv_02', text: 'Harry Potter', difficulty: 1, frequency: 5, hint: 'Saga de magia', pairs: [{ word: 'Narnia', similarity: 0.78, tier: 'A' }, { word: 'Señor Anillos', similarity: 0.82, tier: 'A' }, { word: 'Percy Jackson', similarity: 0.85, tier: 'A' }] },
                { id: 'mv_03', text: 'Batman', difficulty: 1, frequency: 5, hint: 'Superhéroe oscuro', pairs: [{ word: 'Spider-Man', similarity: 0.82, tier: 'A' }, { word: 'Iron Man', similarity: 0.80, tier: 'A' }, { word: 'Superman', similarity: 0.90, tier: 'A' }] },
                { id: 'mv_04', text: 'Titanic', difficulty: 2, frequency: 4, hint: 'Película de barco', pairs: [{ word: 'Pearl Harbor', similarity: 0.68, tier: 'B' }, { word: 'Poseidón', similarity: 0.65, tier: 'B' }, { word: 'Naufrago', similarity: 0.72, tier: 'B' }] },
                { id: 'mv_05', text: 'Matrix', difficulty: 2, frequency: 4, hint: 'Película de ciencia ficción', pairs: [{ word: 'Tron', similarity: 0.72, tier: 'B' }, { word: 'Inception', similarity: 0.78, tier: 'A' }, { word: 'Blade Runner', similarity: 0.75, tier: 'B' }] },
                { id: 'mv_06', text: 'Toy Story', difficulty: 1, frequency: 5, hint: 'Película de animación', pairs: [{ word: 'Shrek', similarity: 0.65, tier: 'B' }, { word: 'Buscando a Nemo', similarity: 0.78, tier: 'A' }, { word: 'Monsters Inc', similarity: 0.82, tier: 'A' }] },
                { id: 'mv_07', text: 'Jurassic Park', difficulty: 2, frequency: 4, hint: 'Película de dinosaurios', pairs: [{ word: 'King Kong', similarity: 0.72, tier: 'B' }, { word: 'Godzilla', similarity: 0.75, tier: 'B' }, { word: 'Rampage', similarity: 0.68, tier: 'B' }] },
                { id: 'mv_08', text: 'El Rey León', difficulty: 1, frequency: 5, hint: 'Película animada clásica', pairs: [{ word: 'Bambi', similarity: 0.65, tier: 'B' }, { word: 'El Libro de la Selva', similarity: 0.78, tier: 'A' }, { word: 'Madagascar', similarity: 0.72, tier: 'B' }] },
                { id: 'mv_09', text: 'Piratas del Caribe', difficulty: 2, frequency: 4, hint: 'Película de piratas', pairs: [{ word: 'Peter Pan', similarity: 0.58, tier: 'C' }, { word: 'Moby Dick', similarity: 0.55, tier: 'C' }, { word: 'La Sirenita', similarity: 0.52, tier: 'C' }] },
                { id: 'mv_10', text: 'Indiana Jones', difficulty: 2, frequency: 4, hint: 'Película de aventuras', pairs: [{ word: 'Lara Croft', similarity: 0.82, tier: 'A' }, { word: 'La Momia', similarity: 0.75, tier: 'B' }, { word: 'Uncharted', similarity: 0.85, tier: 'A' }] },
                { id: 'mv_11', text: 'Frozen', difficulty: 1, frequency: 5, hint: 'Película de princesas', pairs: [{ word: 'Enredados', similarity: 0.82, tier: 'A' }, { word: 'Brave', similarity: 0.72, tier: 'B' }, { word: 'Moana', similarity: 0.78, tier: 'A' }] },
                { id: 'mv_12', text: 'Avatar', difficulty: 2, frequency: 4, hint: 'Película de otro mundo', pairs: [{ word: 'Interstellar', similarity: 0.65, tier: 'B' }, { word: 'Gravity', similarity: 0.58, tier: 'C' }, { word: 'Prometheus', similarity: 0.68, tier: 'B' }] },
                { id: 'mv_13', text: 'Rocky', difficulty: 3, frequency: 3, hint: 'Película de boxeo', pairs: [{ word: 'Karate Kid', similarity: 0.78, tier: 'A' }, { word: 'Creed', similarity: 0.92, tier: 'A' }, { word: 'Raging Bull', similarity: 0.82, tier: 'A' }] },
                { id: 'mv_14', text: 'James Bond', difficulty: 2, frequency: 4, hint: 'Película de espías', pairs: [{ word: 'Mission Impossible', similarity: 0.88, tier: 'A' }, { word: 'Jason Bourne', similarity: 0.85, tier: 'A' }, { word: 'Kingsman', similarity: 0.78, tier: 'A' }] },
                { id: 'mv_15', text: 'Stranger Things', difficulty: 2, frequency: 4, hint: 'Serie de misterio', pairs: [{ word: 'Dark', similarity: 0.72, tier: 'B' }, { word: 'The OA', similarity: 0.68, tier: 'B' }, { word: 'Black Mirror', similarity: 0.60, tier: 'C' }] },
                { id: 'mv_16', text: 'Friends', difficulty: 1, frequency: 5, hint: 'Serie de comedia', pairs: [{ word: 'Seinfeld', similarity: 0.85, tier: 'A' }, { word: 'How I Met', similarity: 0.88, tier: 'A' }, { word: 'The Big Bang', similarity: 0.80, tier: 'A' }] },
                { id: 'mv_17', text: 'Breaking Bad', difficulty: 2, frequency: 4, hint: 'Serie de drama', pairs: [{ word: 'Narcos', similarity: 0.78, tier: 'A' }, { word: 'Ozark', similarity: 0.75, tier: 'B' }, { word: 'Better Call Saul', similarity: 0.92, tier: 'A' }] },
                { id: 'mv_18', text: 'Bob Esponja', difficulty: 1, frequency: 5, hint: 'Serie de dibujos', pairs: [{ word: 'Doraemon', similarity: 0.65, tier: 'B' }, { word: 'Los Simpson', similarity: 0.72, tier: 'B' }, { word: 'Futurama', similarity: 0.68, tier: 'B' }] },
                { id: 'mv_19', text: 'Gladiator', difficulty: 3, frequency: 3, hint: 'Película de gladiadores', pairs: [{ word: 'Troya', similarity: 0.82, tier: 'A' }, { word: 'Espartaco', similarity: 0.88, tier: 'A' }, { word: '300', similarity: 0.85, tier: 'A' }] },
                { id: 'mv_20', text: 'Coco', difficulty: 1, frequency: 5, hint: 'Película de Pixar', pairs: [{ word: 'Soul', similarity: 0.82, tier: 'A' }, { word: 'Inside Out', similarity: 0.78, tier: 'A' }, { word: 'Up', similarity: 0.72, tier: 'B' }] },
            ]
        },
        {
            id: 'music', name: 'Música', emoji: '🎵', premium: false,
            words: [
                { id: 'mu_01', text: 'Guitarra', difficulty: 1, frequency: 5, hint: 'Instrumento de cuerda', pairs: [{ word: 'Ukulele', similarity: 0.85, tier: 'A' }, { word: 'Bajo', similarity: 0.82, tier: 'A' }, { word: 'Banjo', similarity: 0.78, tier: 'A' }] },
                { id: 'mu_02', text: 'Piano', difficulty: 1, frequency: 5, hint: 'Instrumento de teclas', pairs: [{ word: 'Órgano', similarity: 0.82, tier: 'A' }, { word: 'Teclado', similarity: 0.90, tier: 'A' }, { word: 'Clavecín', similarity: 0.78, tier: 'A' }] },
                { id: 'mu_03', text: 'Batería', difficulty: 2, frequency: 4, hint: 'Instrumento de percusión', pairs: [{ word: 'Bongos', similarity: 0.78, tier: 'A' }, { word: 'Tambor', similarity: 0.88, tier: 'A' }, { word: 'Cajón', similarity: 0.82, tier: 'A' }] },
                { id: 'mu_04', text: 'Violín', difficulty: 2, frequency: 4, hint: 'Instrumento de arco', pairs: [{ word: 'Viola', similarity: 0.92, tier: 'A' }, { word: 'Violonchelo', similarity: 0.88, tier: 'A' }, { word: 'Contrabajo', similarity: 0.78, tier: 'A' }] },
                { id: 'mu_05', text: 'Flauta', difficulty: 2, frequency: 4, hint: 'Instrumento de viento', pairs: [{ word: 'Clarinete', similarity: 0.82, tier: 'A' }, { word: 'Oboe', similarity: 0.85, tier: 'A' }, { word: 'Piccolo', similarity: 0.90, tier: 'A' }] },
                { id: 'mu_06', text: 'Trompeta', difficulty: 2, frequency: 4, hint: 'Instrumento de metal', pairs: [{ word: 'Trombón', similarity: 0.88, tier: 'A' }, { word: 'Tuba', similarity: 0.82, tier: 'A' }, { word: 'Corneta', similarity: 0.90, tier: 'A' }] },
                { id: 'mu_07', text: 'Rock', difficulty: 1, frequency: 5, hint: 'Género musical', pairs: [{ word: 'Punk', similarity: 0.82, tier: 'A' }, { word: 'Metal', similarity: 0.85, tier: 'A' }, { word: 'Grunge', similarity: 0.88, tier: 'A' }] },
                { id: 'mu_08', text: 'Reggaetón', difficulty: 1, frequency: 5, hint: 'Género urbano', pairs: [{ word: 'Trap', similarity: 0.78, tier: 'A' }, { word: 'Dancehall', similarity: 0.72, tier: 'B' }, { word: 'Dembow', similarity: 0.85, tier: 'A' }] },
                { id: 'mu_09', text: 'Jazz', difficulty: 3, frequency: 3, hint: 'Género musical clásico', pairs: [{ word: 'Blues', similarity: 0.88, tier: 'A' }, { word: 'Swing', similarity: 0.82, tier: 'A' }, { word: 'Bossa nova', similarity: 0.75, tier: 'B' }] },
                { id: 'mu_10', text: 'Rap', difficulty: 1, frequency: 5, hint: 'Género de rima', pairs: [{ word: 'Hip-hop', similarity: 0.92, tier: 'A' }, { word: 'Trap', similarity: 0.82, tier: 'A' }, { word: 'Spoken word', similarity: 0.65, tier: 'B' }] },
                { id: 'mu_11', text: 'Ópera', difficulty: 4, frequency: 2, hint: 'Espectáculo musical', pairs: [{ word: 'Musical', similarity: 0.78, tier: 'A' }, { word: 'Zarzuela', similarity: 0.85, tier: 'A' }, { word: 'Cabaret', similarity: 0.62, tier: 'B' }] },
                { id: 'mu_12', text: 'DJ', difficulty: 2, frequency: 4, hint: 'Artista de mezclas', pairs: [{ word: 'Productor', similarity: 0.72, tier: 'B' }, { word: 'MC', similarity: 0.68, tier: 'B' }, { word: 'VJ', similarity: 0.82, tier: 'A' }] },
                { id: 'mu_13', text: 'Concierto', difficulty: 2, frequency: 4, hint: 'Evento musical', pairs: [{ word: 'Festival', similarity: 0.82, tier: 'A' }, { word: 'Recital', similarity: 0.88, tier: 'A' }, { word: 'Gira', similarity: 0.70, tier: 'B' }] },
                { id: 'mu_14', text: 'Salsa', difficulty: 2, frequency: 4, hint: 'Baile latino', pairs: [{ word: 'Bachata', similarity: 0.88, tier: 'A' }, { word: 'Merengue', similarity: 0.85, tier: 'A' }, { word: 'Cumbia', similarity: 0.82, tier: 'A' }] },
                { id: 'mu_15', text: 'K-pop', difficulty: 2, frequency: 4, hint: 'Género asiático', pairs: [{ word: 'J-pop', similarity: 0.92, tier: 'A' }, { word: 'C-pop', similarity: 0.88, tier: 'A' }, { word: 'Eurovisión', similarity: 0.55, tier: 'C' }] },
                { id: 'mu_16', text: 'Arpa', difficulty: 4, frequency: 2, hint: 'Instrumento de cuerda', pairs: [{ word: 'Lira', similarity: 0.85, tier: 'A' }, { word: 'Cítara', similarity: 0.82, tier: 'A' }, { word: 'Laúd', similarity: 0.78, tier: 'A' }] },
                { id: 'mu_17', text: 'Saxofón', difficulty: 3, frequency: 3, hint: 'Instrumento de viento', pairs: [{ word: 'Clarinete', similarity: 0.85, tier: 'A' }, { word: 'Fagot', similarity: 0.72, tier: 'B' }, { word: 'Armónica', similarity: 0.60, tier: 'C' }] },
                { id: 'mu_18', text: 'Flamenco', difficulty: 3, frequency: 3, hint: 'Baile español', pairs: [{ word: 'Tango', similarity: 0.78, tier: 'A' }, { word: 'Samba', similarity: 0.72, tier: 'B' }, { word: 'Bolero', similarity: 0.75, tier: 'B' }] },
                { id: 'mu_19', text: 'Sintetizador', difficulty: 4, frequency: 2, hint: 'Instrumento electrónico', pairs: [{ word: 'Máquina de ritmos', similarity: 0.82, tier: 'A' }, { word: 'Theremin', similarity: 0.72, tier: 'B' }, { word: 'Sampler', similarity: 0.78, tier: 'A' }] },
                { id: 'mu_20', text: 'Karaoke', difficulty: 1, frequency: 5, hint: 'Entretenimiento musical', pairs: [{ word: 'Coro', similarity: 0.62, tier: 'B' }, { word: 'Playback', similarity: 0.72, tier: 'B' }, { word: 'Dúo', similarity: 0.55, tier: 'C' }] },
            ]
        },
        {
            id: 'science', name: 'Ciencia y Tecnología', emoji: '🧪', premium: false,
            words: [
                { id: 'sc_01', text: 'Robot', difficulty: 2, frequency: 4, hint: 'Máquina automática', pairs: [{ word: 'Androide', similarity: 0.90, tier: 'A' }, { word: 'Dron', similarity: 0.62, tier: 'B' }, { word: 'Cyborg', similarity: 0.85, tier: 'A' }] },
                { id: 'sc_02', text: 'Telescopio', difficulty: 3, frequency: 3, hint: 'Instrumento óptico', pairs: [{ word: 'Microscopio', similarity: 0.85, tier: 'A' }, { word: 'Prismáticos', similarity: 0.72, tier: 'B' }, { word: 'Lupa', similarity: 0.65, tier: 'B' }] },
                { id: 'sc_03', text: 'ADN', difficulty: 4, frequency: 2, hint: 'Molécula biológica', pairs: [{ word: 'ARN', similarity: 0.92, tier: 'A' }, { word: 'Gen', similarity: 0.82, tier: 'A' }, { word: 'Cromosoma', similarity: 0.78, tier: 'A' }] },
                { id: 'sc_04', text: 'Átomo', difficulty: 4, frequency: 2, hint: 'Partícula fundamental', pairs: [{ word: 'Molécula', similarity: 0.85, tier: 'A' }, { word: 'Electrón', similarity: 0.82, tier: 'A' }, { word: 'Protón', similarity: 0.88, tier: 'A' }] },
                { id: 'sc_05', text: 'Internet', difficulty: 1, frequency: 5, hint: 'Red de comunicación', pairs: [{ word: 'Intranet', similarity: 0.90, tier: 'A' }, { word: 'WiFi', similarity: 0.78, tier: 'A' }, { word: 'Bluetooth', similarity: 0.62, tier: 'B' }] },
                { id: 'sc_06', text: 'Cohete', difficulty: 2, frequency: 4, hint: 'Vehículo espacial', pairs: [{ word: 'Satélite', similarity: 0.72, tier: 'B' }, { word: 'Transbordador', similarity: 0.88, tier: 'A' }, { word: 'Nave', similarity: 0.82, tier: 'A' }] },
                { id: 'sc_07', text: 'Dinosaurio', difficulty: 2, frequency: 4, hint: 'Animal prehistórico', pairs: [{ word: 'Mamut', similarity: 0.78, tier: 'A' }, { word: 'Fósil', similarity: 0.65, tier: 'B' }, { word: 'Meteorito', similarity: 0.50, tier: 'C' }] },
                { id: 'sc_08', text: 'Volcán', difficulty: 2, frequency: 4, hint: 'Fenómeno geológico', pairs: [{ word: 'Géiser', similarity: 0.82, tier: 'A' }, { word: 'Terremoto', similarity: 0.72, tier: 'B' }, { word: 'Tsunami', similarity: 0.62, tier: 'B' }] },
                { id: 'sc_09', text: 'Gravedad', difficulty: 4, frequency: 2, hint: 'Fuerza física', pairs: [{ word: 'Magnetismo', similarity: 0.75, tier: 'B' }, { word: 'Inercia', similarity: 0.72, tier: 'B' }, { word: 'Fricción', similarity: 0.65, tier: 'B' }] },
                { id: 'sc_10', text: 'Láser', difficulty: 3, frequency: 3, hint: 'Haz de luz', pairs: [{ word: 'Radar', similarity: 0.78, tier: 'A' }, { word: 'Sonar', similarity: 0.75, tier: 'B' }, { word: 'Rayos X', similarity: 0.72, tier: 'B' }] },
                { id: 'sc_11', text: 'Vacuna', difficulty: 3, frequency: 3, hint: 'Medicina preventiva', pairs: [{ word: 'Antibiótico', similarity: 0.78, tier: 'A' }, { word: 'Antídoto', similarity: 0.82, tier: 'A' }, { word: 'Suero', similarity: 0.72, tier: 'B' }] },
                { id: 'sc_12', text: 'Algoritmo', difficulty: 5, frequency: 1, hint: 'Proceso lógico', pairs: [{ word: 'Ecuación', similarity: 0.72, tier: 'B' }, { word: 'Fórmula', similarity: 0.75, tier: 'B' }, { word: 'Código', similarity: 0.68, tier: 'B' }] },
                { id: 'sc_13', text: 'Galaxia', difficulty: 3, frequency: 3, hint: 'Estructura del cosmos', pairs: [{ word: 'Nebulosa', similarity: 0.82, tier: 'A' }, { word: 'Constelación', similarity: 0.78, tier: 'A' }, { word: 'Supernova', similarity: 0.72, tier: 'B' }] },
                { id: 'sc_14', text: 'Célula', difficulty: 3, frequency: 3, hint: 'Unidad de vida', pairs: [{ word: 'Bacteria', similarity: 0.72, tier: 'B' }, { word: 'Virus', similarity: 0.65, tier: 'B' }, { word: 'Ameba', similarity: 0.78, tier: 'A' }] },
                { id: 'sc_15', text: 'Reactor nuclear', difficulty: 5, frequency: 1, hint: 'Fuente de energía', pairs: [{ word: 'Central eólica', similarity: 0.78, tier: 'A' }, { word: 'Placa solar', similarity: 0.72, tier: 'B' }, { word: 'Presa', similarity: 0.65, tier: 'B' }] },
                { id: 'sc_16', text: 'Inteligencia artificial', difficulty: 4, frequency: 2, hint: 'Tecnología avanzada', pairs: [{ word: 'Machine learning', similarity: 0.90, tier: 'A' }, { word: 'Chatbot', similarity: 0.72, tier: 'B' }, { word: 'Red neuronal', similarity: 0.85, tier: 'A' }] },
                { id: 'sc_17', text: 'Agujero negro', difficulty: 4, frequency: 2, hint: 'Objeto del espacio', pairs: [{ word: 'Estrella', similarity: 0.68, tier: 'B' }, { word: 'Quásar', similarity: 0.82, tier: 'A' }, { word: 'Púlsar', similarity: 0.85, tier: 'A' }] },
                { id: 'sc_18', text: 'Impresora 3D', difficulty: 3, frequency: 3, hint: 'Máquina de fabricación', pairs: [{ word: 'Escáner', similarity: 0.65, tier: 'B' }, { word: 'CNC', similarity: 0.72, tier: 'B' }, { word: 'Cortadora láser', similarity: 0.78, tier: 'A' }] },
                { id: 'sc_19', text: 'Clon', difficulty: 4, frequency: 2, hint: 'Copia genética', pairs: [{ word: 'Mutante', similarity: 0.72, tier: 'B' }, { word: 'Híbrido', similarity: 0.68, tier: 'B' }, { word: 'Transgénico', similarity: 0.78, tier: 'A' }] },
                { id: 'sc_20', text: 'Realidad virtual', difficulty: 3, frequency: 3, hint: 'Tecnología inmersiva', pairs: [{ word: 'Realidad aumentada', similarity: 0.92, tier: 'A' }, { word: 'Metaverso', similarity: 0.82, tier: 'A' }, { word: 'Simulador', similarity: 0.75, tier: 'B' }] },
            ]
        },
        {
            id: 'emotions', name: 'Emociones', emoji: '🎭', premium: false,
            words: [
                { id: 'em_01', text: 'Alegría', difficulty: 1, frequency: 5, hint: 'Emoción positiva', pairs: [{ word: 'Euforia', similarity: 0.85, tier: 'A' }, { word: 'Felicidad', similarity: 0.92, tier: 'A' }, { word: 'Entusiasmo', similarity: 0.78, tier: 'A' }] },
                { id: 'em_02', text: 'Tristeza', difficulty: 1, frequency: 5, hint: 'Emoción negativa', pairs: [{ word: 'Melancolía', similarity: 0.85, tier: 'A' }, { word: 'Nostalgia', similarity: 0.72, tier: 'B' }, { word: 'Pena', similarity: 0.88, tier: 'A' }] },
                { id: 'em_03', text: 'Miedo', difficulty: 1, frequency: 5, hint: 'Emoción de peligro', pairs: [{ word: 'Pánico', similarity: 0.88, tier: 'A' }, { word: 'Terror', similarity: 0.85, tier: 'A' }, { word: 'Ansiedad', similarity: 0.72, tier: 'B' }] },
                { id: 'em_04', text: 'Amor', difficulty: 1, frequency: 5, hint: 'Sentimiento afectivo', pairs: [{ word: 'Cariño', similarity: 0.85, tier: 'A' }, { word: 'Pasión', similarity: 0.78, tier: 'A' }, { word: 'Ternura', similarity: 0.82, tier: 'A' }] },
                { id: 'em_05', text: 'Rabia', difficulty: 2, frequency: 4, hint: 'Emoción intensa', pairs: [{ word: 'Furia', similarity: 0.92, tier: 'A' }, { word: 'Ira', similarity: 0.90, tier: 'A' }, { word: 'Frustración', similarity: 0.72, tier: 'B' }] },
                { id: 'em_06', text: 'Sorpresa', difficulty: 2, frequency: 4, hint: 'Emoción inesperada', pairs: [{ word: 'Asombro', similarity: 0.88, tier: 'A' }, { word: 'Estupor', similarity: 0.78, tier: 'A' }, { word: 'Incredulidad', similarity: 0.72, tier: 'B' }] },
                { id: 'em_07', text: 'Envidia', difficulty: 3, frequency: 3, hint: 'Sentimiento de carencia', pairs: [{ word: 'Celos', similarity: 0.88, tier: 'A' }, { word: 'Codicia', similarity: 0.72, tier: 'B' }, { word: 'Rivalidad', similarity: 0.62, tier: 'B' }] },
                { id: 'em_08', text: 'Orgullo', difficulty: 2, frequency: 4, hint: 'Sentimiento de superioridad', pairs: [{ word: 'Vanidad', similarity: 0.78, tier: 'A' }, { word: 'Soberbia', similarity: 0.82, tier: 'A' }, { word: 'Dignidad', similarity: 0.65, tier: 'B' }] },
                { id: 'em_09', text: 'Vergüenza', difficulty: 2, frequency: 4, hint: 'Emoción social', pairs: [{ word: 'Timidez', similarity: 0.75, tier: 'B' }, { word: 'Pudor', similarity: 0.82, tier: 'A' }, { word: 'Humillación', similarity: 0.72, tier: 'B' }] },
                { id: 'em_10', text: 'Esperanza', difficulty: 2, frequency: 4, hint: 'Sentimiento de futuro', pairs: [{ word: 'Ilusión', similarity: 0.85, tier: 'A' }, { word: 'Fe', similarity: 0.72, tier: 'B' }, { word: 'Optimismo', similarity: 0.88, tier: 'A' }] },
                { id: 'em_11', text: 'Aburrimiento', difficulty: 2, frequency: 4, hint: 'Falta de interés', pairs: [{ word: 'Indiferencia', similarity: 0.72, tier: 'B' }, { word: 'Apatía', similarity: 0.82, tier: 'A' }, { word: 'Desgana', similarity: 0.85, tier: 'A' }] },
                { id: 'em_12', text: 'Gratitud', difficulty: 3, frequency: 3, hint: 'Sentimiento de aprecio', pairs: [{ word: 'Admiración', similarity: 0.72, tier: 'B' }, { word: 'Respeto', similarity: 0.68, tier: 'B' }, { word: 'Devoción', similarity: 0.72, tier: 'B' }] },
                { id: 'em_13', text: 'Soledad', difficulty: 2, frequency: 4, hint: 'Estado de aislamiento', pairs: [{ word: 'Aislamiento', similarity: 0.88, tier: 'A' }, { word: 'Abandono', similarity: 0.78, tier: 'A' }, { word: 'Vacío', similarity: 0.72, tier: 'B' }] },
                { id: 'em_14', text: 'Valentía', difficulty: 3, frequency: 3, hint: 'Sentimiento de fuerza', pairs: [{ word: 'Coraje', similarity: 0.92, tier: 'A' }, { word: 'Arrojo', similarity: 0.85, tier: 'A' }, { word: 'Osadía', similarity: 0.82, tier: 'A' }] },
                { id: 'em_15', text: 'Culpa', difficulty: 3, frequency: 3, hint: 'Sentimiento de error', pairs: [{ word: 'Remordimiento', similarity: 0.88, tier: 'A' }, { word: 'Arrepentimiento', similarity: 0.85, tier: 'A' }, { word: 'Pesar', similarity: 0.78, tier: 'A' }] },
                { id: 'em_16', text: 'Paz', difficulty: 1, frequency: 5, hint: 'Estado de calma', pairs: [{ word: 'Serenidad', similarity: 0.88, tier: 'A' }, { word: 'Calma', similarity: 0.90, tier: 'A' }, { word: 'Tranquilidad', similarity: 0.92, tier: 'A' }] },
                { id: 'em_17', text: 'Estrés', difficulty: 2, frequency: 4, hint: 'Estado de presión', pairs: [{ word: 'Presión', similarity: 0.82, tier: 'A' }, { word: 'Tensión', similarity: 0.88, tier: 'A' }, { word: 'Agobio', similarity: 0.85, tier: 'A' }] },
                { id: 'em_18', text: 'Curiosidad', difficulty: 2, frequency: 4, hint: 'Deseo de saber', pairs: [{ word: 'Intriga', similarity: 0.82, tier: 'A' }, { word: 'Interés', similarity: 0.78, tier: 'A' }, { word: 'Fascinación', similarity: 0.85, tier: 'A' }] },
                { id: 'em_19', text: 'Desprecio', difficulty: 4, frequency: 2, hint: 'Sentimiento de rechazo', pairs: [{ word: 'Desdén', similarity: 0.90, tier: 'A' }, { word: 'Rechazo', similarity: 0.78, tier: 'A' }, { word: 'Intolerancia', similarity: 0.68, tier: 'B' }] },
                { id: 'em_20', text: 'Éxtasis', difficulty: 4, frequency: 2, hint: 'Emoción extrema positiva', pairs: [{ word: 'Dicha', similarity: 0.85, tier: 'A' }, { word: 'Gozo', similarity: 0.88, tier: 'A' }, { word: 'Plenitud', similarity: 0.82, tier: 'A' }] },
            ]
        },
    ]
};

// Utility: get categories (filtering premium)
export function getCategories(includePremium = false) {
    return WORD_DATABASE.categories.filter(c => includePremium || !c.premium);
}

// Utility: get word pool for a category
export function getWordPool(categoryId) {
    const cat = WORD_DATABASE.categories.find(c => c.id === categoryId);
    return cat ? cat.words : [];
}
