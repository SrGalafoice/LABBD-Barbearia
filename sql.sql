USE projeto_barbearia;

-- 1. Inserir o Barbeiro (seguindo a sua entidade: id_barbeiros)
INSERT INTO barbeiros (nome, telefone, status) 
VALUES ('Seu Jorge', '11999999999', 'Ativo');

-- 2. Inserir o Cliente (ajustado para o padrão comum, já que não vimos essa entidade)
-- Se a sua entidade Cliente usar outro nome, o Hibernate criará automático e você pode rodar este:
INSERT INTO clientes (nome, telefone, email) 
VALUES ('João Silva', '11888888888', 'joao@email.com');

-- 3. Inserir o Serviço (seguindo a sua entidade: tabela serviços e coluna id_serviços)
INSERT INTO serviços (nome_serviço, preco, duracao_minutos) 
VALUES ('Cabelo e Barba', 60.00, 45);

-- 4. Inserir o Agendamento de teste vinculando os IDs (com base nas chaves geradas)
INSERT INTO agendamentos (id_cliente, id_barbeiro, id_servico, data_hora, status, valor_pago) 
VALUES (1, 1, 1, NOW(), 'CONFIRMADO', 60.00);

USE projeto_barbearia;
DESCRIBE agendamentos;
USE projeto_barbearia;
SHOW TABLES;

SELECT * FROM agendamentos;



DROP PROCEDURE IF EXISTS CalcularFaturamentoBarbeiro;

DELIMITER $$

USE projeto_barbearia;

DROP PROCEDURE IF EXISTS SP_FaturamentoBarbeiro;

DELIMITER $$

CREATE PROCEDURE SP_FaturamentoBarbeiro(
    IN p_id_barbeiro INT,
    OUT totalFaturado DECIMAL(10,2) -- O segundo parâmetro que o Java quer!
)
BEGIN
 SELECT 
    CASE 
        WHEN SUM(valor_pago) IS NULL THEN 0.00
        ELSE SUM(valor_pago)
    END INTO totalFaturado
FROM agendamentos 
WHERE id_barbeiro = p_id_barbeiro AND status = 'FINALIZADO';
END $$

DELIMITER ;
USE projeto_barbearia;
CALL SP_FaturamentoBarbeiro(1); -- Troque o 1 pelo ID real do Seu Jorge no seu banco

-- Desativa a trava para podermos forçar o ID 1 nas tabelas
SET SQL_SAFE_UPDATES = 0;

-- 2. Inserir o Cliente Base (Chave presumida: id_cliente)
INSERT INTO clientes (id_clientes, nome, telefone, email) 
VALUES (1, 'João Silva', '11888888888', 'joao@email.com');

-- 3. Inserir o Serviço Base (Chave: id_serviços)
INSERT INTO serviços (id_serviços, duracao_minutos, nome_serviço, preco) 
VALUES (1, 45, 'Cabelo e Barba', 60.00);

SET SQL_SAFE_UPDATES = 1;





-- Desativa temporariamente a trava de segurança do MySQL
SET SQL_SAFE_UPDATES = 0;

-- 1. Deleta primeiro os agendamentos (que dependem das outras tabelas)
DELETE FROM agendamentos;

-- 2. Deleta os registros das tabelas base
DELETE FROM serviços;
DELETE FROM barbeiros;
DELETE FROM clientes;

-- 3. Reseta os contadores do AUTO_INCREMENT para começar do ID 1 novamente
ALTER TABLE agendamentos AUTO_INCREMENT = 1;
ALTER TABLE serviços AUTO_INCREMENT = 1;
ALTER TABLE barbeiros AUTO_INCREMENT = 1;
ALTER TABLE clientes AUTO_INCREMENT = 1;

-- Reativa a trava de segurança por precaução
SET SQL_SAFE_UPDATES = 1;

INSERT IGNORE INTO barbeiros (id_barbeiros, nome) VALUES 
(1, 'Seu Jorge'),
(2, 'Cleiton Rasta'),
(3, 'Vagner Mancini (Sem Agendamentos)');

-- Inserindo Clientes de teste
INSERT IGNORE INTO clientes (id_clientes, nome) VALUES 
(1, 'João Silva'),
(2, 'Marcos Souza'),
(3, 'Amanda Lima');

-- Inserindo Serviços de teste
INSERT IGNORE INTO serviços (id_serviços, nome_serviço, preco) VALUES 
(1, 'Corte Cabelo Imperial', 50.00),
(2, 'Barba Completa', 35.00),
(3, 'Combo Premium', 80.00);


-- -----------------------------------------------------
-- 📅 CENÁRIO 2: INSERÇÃO DOS AGENDAMENTOS DE TESTE
-- -----------------------------------------------------

-- ====== BARBEIRO 1: SEU JORGE (Cenário Acumulativo) ======
-- Teste A: Agendamento antigo já FINALIZADO
INSERT INTO agendamentos (data_hora, status, valor_pago, id_cliente, id_barbeiro, id_servico) 
VALUES (NOW() - INTERVAL 2 DAY, 'FINALIZADO', 50.00, 1, 1, 1);

-- Teste B: Agendamento para hoje CONFIRMADO
INSERT INTO agendamentos (data_hora, status, valor_pago, id_cliente, id_barbeiro, id_servico) 
VALUES (NOW(), 'CONFIRMADO', 35.00, 2, 1, 2);

-- Teste C: Agendamento futuro ainda como AGENDADO
INSERT INTO agendamentos (data_hora, status, valor_pago, id_cliente, id_barbeiro, id_servico) 
VALUES (NOW() + INTERVAL 1 DAY, 'AGENDADO', 80.00, 3, 1, 3);

-- 🔥 RESULTADO ESPERADO PARA O SEU JORGE (ID 1): R$ 165.00 (50 + 35 + 80)


-- ====== BARBEIRO 2: CLEITON RASTA (Cenário Valores Quebrados) ======
-- Teste A: Serviço com centavos para testar a precisão do DECIMAL(10,2)
INSERT INTO agendamentos (data_hora, status, valor_pago, id_cliente, id_barbeiro, id_servico) 
VALUES (NOW(), 'FINALIZADO', 45.50, 1, 2, 1);

-- Teste B: Outro valor quebrado
INSERT INTO agendamentos (data_hora, status, valor_pago, id_cliente, id_barbeiro, id_servico) 
VALUES (NOW(), 'FINALIZADO', 32.25, 2, 2, 2);
