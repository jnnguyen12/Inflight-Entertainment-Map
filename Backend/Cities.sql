-- Create the database
CREATE DATABASE CityDatabase;

-- Switch to the newly created database
USE CityDatabase;

-- Create the table to store city information
CREATE TABLE Cities (
    city_id INT PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL
);
INSERT INTO Cities (city_id, city_name, country, latitude, longitude)
VALUES (1, 'New York City', 'United States', 40.7128, -74.0060),
  (1, 'Tokyo', 'Japan', 35.682839, 139.759455),
    (2, 'Delhi', 'India', 28.613939, 77.209021),
    (3, 'Shanghai', 'China', 31.230416, 121.473701),
    (4, 'São Paulo', 'Brazil', -23.550520, -46.633308),
    (5, 'Mumbai', 'India', 19.076090, 72.877426),
    (6, 'Mexico City', 'Mexico', 19.432608, -99.133209),
    (7, 'Beijing', 'China', 39.904200, 116.407396),
    (8, 'Cairo', 'Egypt', 30.044420, 31.235712),
    (9, 'Dhaka', 'Bangladesh', 23.810331, 90.412521),
    (10, 'Osaka', 'Japan', 34.693737, 135.502165),
    (11, 'Karachi', 'Pakistan', 24.860735, 67.001137),
    (12, 'Chongqing', 'China', 29.563010, 106.551559),
    (13, 'Istanbul', 'Turkey', 41.008240, 28.978359),
    (14, 'Buenos Aires', 'Argentina', -34.611792, -58.417236),
    (15, 'Kolkata', 'India', 22.572645, 88.363892),
    (16, 'Kinshasa', 'Democratic Republic of the Congo', -4.441931, 15.266293),
    (17, 'Lahore', 'Pakistan', 31.549723, 74.343611),
    (18, 'Lima', 'Peru', -12.046374, -77.042793),
    (19, 'Bangkok', 'Thailand', 13.756331, 100.501762),
    (20, 'Paris', 'France', 48.8566, 2.3522);
