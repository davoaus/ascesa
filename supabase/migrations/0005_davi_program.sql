-- Rotina real do Davi: split de 5 dias (substitui o programa padrão genérico).
-- Ordenação de programas (para o split aparecer na ordem dos dias).
alter table public.programs add column if not exists sort_order integer not null default 0;

-- Exercícios da rotina (novos entram; existentes são reaproveitados por slug).
insert into public.exercises (slug, name, category, primary_muscle, is_bodyweight) values
  ('supino-reto-maquina',      'Supino reto na máquina',        'push',   'Peito',      false),
  ('supino-inclinado-maquina', 'Supino inclinado na máquina',   'push',   'Peito',      false),
  ('supino-declinado-maquina', 'Supino declinado na máquina',   'push',   'Peito',      false),
  ('crossover-polia',          'Crossover na polia',            'push',   'Peito',      false),
  ('triceps-testa-w',          'Tríceps testa (barra W)',       'push',   'Tríceps',    false),
  ('triceps-corda',            'Tríceps corda na polia',        'push',   'Tríceps',    false),
  ('triceps-frances',          'Tríceps francês com halter',    'push',   'Tríceps',    false),
  ('mergulho-banco',           'Mergulho no banco',             'push',   'Tríceps',    true),
  ('remada-cavalinho',         'Remada cavalinho (T-bar)',      'pull',   'Costas',     false),
  ('remada-maquina',           'Remada na máquina',             'pull',   'Costas',     false),
  ('remada-baixa',             'Remada baixa na polia',         'pull',   'Costas',     false),
  ('pullover-polia',           'Pullover na polia',             'pull',   'Costas',     false),
  ('rosca-alternada',          'Rosca alternada com halteres',  'pull',   'Bíceps',     false),
  ('rosca-martelo',            'Rosca martelo',                 'pull',   'Bíceps',     false),
  ('rosca-scott',              'Rosca scott (banco)',           'pull',   'Bíceps',     false),
  ('elevacao-lateral',         'Elevação lateral com halteres', 'push',   'Ombro',      false),
  ('desenvolvimento-arnold',   'Desenvolvimento Arnold',        'push',   'Ombro',      false),
  ('elevacao-frontal',         'Elevação frontal',              'push',   'Ombro',      false),
  ('crucifixo-inverso',        'Crucifixo inverso (posterior)', 'push',   'Ombro',      false),
  ('encolhimento',             'Encolhimento (trapézio)',       'pull',   'Trapézio',   false),
  ('elevacao-pernas',          'Elevação de pernas',            'core',   'Abdômen',    true),
  ('crunch-polia',             'Crunch na polia',               'core',   'Abdômen',    false),
  ('russian-twist',            'Russian twist',                 'core',   'Abdômen',    true),
  ('agachamento-hack',         'Agachamento hack',              'legs',   'Quadríceps', false),
  ('cadeira-extensora',        'Cadeira extensora',             'legs',   'Quadríceps', false),
  ('stiff',                    'Levantamento terra romeno (stiff)', 'legs', 'Posterior', false),
  ('mesa-flexora',             'Mesa flexora',                  'legs',   'Posterior',  false),
  ('cadeira-adutora',          'Cadeira adutora',               'legs',   'Adutores',   false),
  ('cadeira-abdutora',         'Cadeira abdutora',              'legs',   'Abdutores',  false),
  ('panturrilha-em-pe',        'Panturrilha em pé',             'legs',   'Panturrilha', false),
  ('panturrilha-sentado',      'Panturrilha sentado',           'legs',   'Panturrilha', false)
on conflict (slug) do nothing;

-- Substitui o programa padrão genérico pelo split real.
delete from public.programs where is_default = true;

insert into public.programs (user_id, name, is_default, sort_order) values
  (null, 'Seg · Peito + Tríceps',   true, 1),
  (null, 'Ter · Costas + Bíceps',   true, 2),
  (null, 'Qua · Ombros + Abdômen',  true, 3),
  (null, 'Qui · Perna',             true, 4),
  (null, 'Sex · Bíceps + Tríceps',  true, 5);

insert into public.program_exercises (program_id, exercise_id, target_sets, target_reps, sort_order)
select (select id from public.programs where name = 'Seg · Peito + Tríceps'), e.id, v.sets, v.reps, v.ord
from (values
  ('supino-reto-maquina',4,6,1),('supino-inclinado-maquina',3,8,2),('supino-declinado-maquina',3,8,3),
  ('crossover-polia',3,12,4),('triceps-testa-w',3,8,5),('triceps-corda',3,12,6),('mergulho-banco',2,null,7)
) as v(slug,sets,reps,ord) join public.exercises e on e.slug = v.slug;

insert into public.program_exercises (program_id, exercise_id, target_sets, target_reps, sort_order)
select (select id from public.programs where name = 'Ter · Costas + Bíceps'), e.id, v.sets, v.reps, v.ord
from (values
  ('barra-fixa',4,6,1),('remada-cavalinho',4,8,2),('remada-maquina',3,10,3),('remada-baixa',3,10,4),
  ('pullover-polia',3,12,5),('rosca-direta',3,8,6),('rosca-alternada',3,10,7),('rosca-martelo',2,12,8)
) as v(slug,sets,reps,ord) join public.exercises e on e.slug = v.slug;

insert into public.program_exercises (program_id, exercise_id, target_sets, target_reps, sort_order)
select (select id from public.programs where name = 'Qua · Ombros + Abdômen'), e.id, v.sets, v.reps, v.ord
from (values
  ('desenvolvimento',4,6,1),('elevacao-lateral',4,12,2),('desenvolvimento-arnold',3,10,3),
  ('elevacao-frontal',3,12,4),('crucifixo-inverso',3,12,5),('encolhimento',3,12,6),
  ('prancha',3,null,7),('elevacao-pernas',3,12,8),('crunch-polia',3,15,9),('russian-twist',3,20,10)
) as v(slug,sets,reps,ord) join public.exercises e on e.slug = v.slug;

insert into public.program_exercises (program_id, exercise_id, target_sets, target_reps, sort_order)
select (select id from public.programs where name = 'Qui · Perna'), e.id, v.sets, v.reps, v.ord
from (values
  ('agachamento-hack',4,6,1),('leg-press',4,10,2),('cadeira-extensora',3,12,3),('stiff',3,8,4),
  ('mesa-flexora',3,10,5),('cadeira-adutora',3,12,6),('cadeira-abdutora',3,12,7),
  ('panturrilha-em-pe',4,15,8),('panturrilha-sentado',3,15,9)
) as v(slug,sets,reps,ord) join public.exercises e on e.slug = v.slug;

insert into public.program_exercises (program_id, exercise_id, target_sets, target_reps, sort_order)
select (select id from public.programs where name = 'Sex · Bíceps + Tríceps'), e.id, v.sets, v.reps, v.ord
from (values
  ('rosca-direta',4,8,1),('rosca-scott',3,10,2),('rosca-alternada',3,10,3),('rosca-martelo',3,12,4),
  ('triceps-testa-w',4,8,5),('triceps-frances',3,10,6),('triceps-corda',3,12,7),('mergulho-banco',2,null,8)
) as v(slug,sets,reps,ord) join public.exercises e on e.slug = v.slug;
