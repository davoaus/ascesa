-- Data de início por hábito: permite marcar quando o hábito passou a valer,
-- para não cobrar dias anteriores no acompanhamento mensal.
alter table habits add column if not exists start_date date;
