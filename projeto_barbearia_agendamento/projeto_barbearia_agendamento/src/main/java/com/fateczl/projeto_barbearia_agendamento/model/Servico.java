package com.fateczl.projeto_barbearia_agendamento.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "serviços")
@Data
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_serviços")
    private Long id;

    @Column(name = "nome_serviço", nullable = false, length = 100)
    private String nomeServico;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;
}