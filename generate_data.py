
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set the number of rows for the dataset
n_rows = 5000

# Create a date range for the 'timestamp' column
start_date = datetime(2023, 1, 1)
end_date = start_date + timedelta(days=n_rows)
timestamps = pd.to_datetime(np.linspace(start_date.timestamp(), end_date.timestamp(), n_rows), unit='s')

# Create numerical features
numerical_features = pd.DataFrame({
    'feature1': np.random.randn(n_rows),
    'feature2': np.random.rand(n_rows) * 100,
    'feature3': np.random.randint(0, 100, n_rows)
})

# Create categorical features
categorical_features = pd.DataFrame({
    'category1': np.random.choice(['A', 'B', 'C', 'D'], n_rows, p=[0.4, 0.3, 0.2, 0.1]),
    'category2': np.random.choice(['X', 'Y', 'Z'], n_rows, p=[0.6, 0.3, 0.1])
})

# Create the target variable
target = (0.2 * numerical_features['feature1'] +
          0.5 * numerical_features['feature2'] +
          (categorical_features['category1'] == 'A') * 5 +
          np.random.randn(n_rows) > 20).astype(int)

# Combine all the features into a single DataFrame
df = pd.concat([pd.DataFrame({'timestamp': timestamps}),
                 numerical_features,
                 categorical_features,
                 pd.DataFrame({'target': target})], axis=1)

# Save the DataFrame to a CSV file
df.to_csv('synthetic_dataset.csv', index=False)

print("Synthetic dataset created and saved to 'synthetic_dataset.csv'")
