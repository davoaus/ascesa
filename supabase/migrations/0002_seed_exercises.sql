-- Catálogo padrão de exercícios (is_default = true, sem dono).
insert into public.exercises (slug, name, category, primary_muscle, is_bodyweight) values
  ('supino-reto',        'Supino reto',            'push',   'Peito',      false),
  ('supino-inclinado',   'Supino inclinado',       'push',   'Peito',      false),
  ('desenvolvimento',    'Desenvolvimento militar', 'push',   'Ombro',      false),
  ('triceps-testa',      'Tríceps testa',          'push',   'Tríceps',    false),
  ('agachamento',        'Agachamento livre',      'legs',   'Quadríceps', false),
  ('leg-press',          'Leg press',              'legs',   'Quadríceps', false),
  ('levantamento-terra', 'Levantamento terra',     'legs',   'Posterior',  false),
  ('afundo',             'Afundo',                 'legs',   'Glúteo',     false),
  ('barra-fixa',         'Barra fixa',             'pull',   'Costas',     true),
  ('remada-curvada',     'Remada curvada',         'pull',   'Costas',     false),
  ('puxada-alta',        'Puxada alta',            'pull',   'Costas',     false),
  ('rosca-direta',       'Rosca direta',           'pull',   'Bíceps',     false),
  ('prancha',            'Prancha',                'core',   'Abdômen',    true),
  ('abdominal',          'Abdominal',              'core',   'Abdômen',    true),
  ('corrida',            'Corrida',                'cardio', 'Cardio',     true),
  ('mobilidade-quadril', 'Mobilidade de quadril',  'mobility', 'Quadril',  true);
