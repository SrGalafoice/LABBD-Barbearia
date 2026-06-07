package com.fateczl.projeto_barbearia_agendamento.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "barbeiros")
@Data
public class Barbeiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_barbeiros")
    private Long id;

    @Column(nullable = false, length = 45)
    private String nome;

    @Column(length = 20)
    private String telefone;

    @Column(length = 20)
    private String status = "Ativo";
}